const path = require(`path`);
const { fluid } = require(`gatsby-plugin-sharp`);
const { slugify } = require("./src/utils");

// Temporary config that may change and be moved out of this file.
const config = {
  // homeFile: "Introduction", // Optional. If provided it should be a top level index.xml item, otherwise no page will be created at root url.
};

let firstAsHome = true;

exports.onPreInit = ({ reporter }) => {
  if (!config.hasOwnProperty("homeFile")) {
    reporter.info(
      "Using first file item in index.xml files as localized home pages."
    );
  } else {
    const file = config.homeFile;
    if (file && typeof file === "string" && file.trim()) {
      firstAsHome = false;
    } else {
      reporter.warn(
        "Invalid 'homeFile' value. Using first file item in index.xml files as home pages. Check the value set for 'homeFile' in the config."
      );
    }
  }
};

/**
 * Stores a key for each lang code, and in each one an array of objects with
 * file name and its correspongin path for the page url.
 */
const indexTree = {};

const docsIndexes = {};

const imagesData = [];

// Regexp to match the src attr of images in the original HTML files.
const imgSrcRegex = /<\s*img\s[^>]*?src\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gi;

// Image extensions supported by Image Sharp.
const supportedExtensions = {
  jpeg: true,
  jpg: true,
  png: true,
  webp: true,
  tif: true,
  tiff: true,
};

/**
 * @param {Array} arr The original array with the data.
 * @param {Array} finalArr A reference to the final array.
 * @param {string} bPath Optional. Base path, ending slash will be added if not included.
 */
function createArrayOfPathObjs(arr, finalArr, bPath = "") {
  // In case a base path is provided without ending slash add it.
  if (bPath && !bPath.endsWith("/")) {
    bPath + "/";
  }
  for (let i = 0; i < arr.length; i++) {
    const path = bPath + slugify(arr[i].attributes.title) + "/";
    finalArr.push({
      file: arr[i].attributes.file,
      path,
      name: arr[i].attributes.title,
    });
    if (arr[i].children) {
      createArrayOfPathObjs(arr[i].children, finalArr, path);
    }
  }
}

/**
 * Creates the tree of items of a pages index.
 * @param {Array} arr The original array with the data.
 * @param {Array} finalArr The array that will store the output.
 * @param {string} bPath Optional. Base path, ending slash will be added if not included.
 */
function createStructureOfItems(arr, finalArr, bPath = "") {
  // In case a base path is provided without ending slash add it.
  if (bPath && !bPath.endsWith("/")) {
    bPath + "/";
  }
  for (let i = 0; i < arr.length; i++) {
    const path = bPath + slugify(arr[i].attributes.title) + "/";
    finalArr.push({
      label: arr[i].attributes.title,
      url: path,
      items: [],
    });
    if (arr[i].children) {
      createStructureOfItems(arr[i].children, finalArr[i].items, path);
    }
  }
}

/**
 * Replaces anchor's href values that point to HTML files in the same folder.
 * The new href value is a relative path (without the web origin part).
 * If the href value contains a page anchor at the end it will be preserved.
 * @param {string} stringHTML Input HTML as a string.
 * @param {Object[]} pathObjsArray An array of objects with at least 'path' and 'file' values.
 * @param {string} lang The lang code of the file.
 * @param {string} defaultLang The default lang code set for the site.
 * @param {string} fileName Optional. The name of the HTML file being processed for error reporting purposes.
 */
function replaceHTMLAnchorsHref(
  stringHTML,
  pathObjsArray,
  lang,
  defaultLang,
  fileName = ""
) {
  // Regexp to match the href attr of anchor HTML elements.
  const anchorHrefRegex = /<\s*a\s[^>]*?href\s*=\s*['\"]([^'\"]*?)['\"][^>]*?>/gi;

  return stringHTML.replace(anchorHrefRegex, (match, p1) => {
    const trimmedHref = p1.trim();
    // If starts with https:// http:// or www. then skip it.
    const isExternalHref =
      /^https?:\/\//.test(trimmedHref) || trimmedHref.startsWith("www.");
    if (!isExternalHref) {
      // If contains a '/' then skip because we are only treating same directory files.
      if (!trimmedHref.includes("/")) {
        const hrefFileNameAndAnchor = trimmedHref.split("#");
        const hrefFileName = hrefFileNameAndAnchor[0]
          .toLowerCase()
          .replace(".html", "");
        const pageAnchor =
          hrefFileNameAndAnchor.length > 1
            ? `#${hrefFileNameAndAnchor[1]}`
            : "";
        const pathObj = pathObjsArray.find(
          pathObj => pathObj.file.toLowerCase() === hrefFileName
        );
        if (pathObj) {
          const newHref =
            "/" +
            (defaultLang !== lang ? lang + "/" : "") +
            pathObj.path +
            pageAnchor;
          return match.replace(p1, newHref);
        } else {
          console.log(
            `[HTML anchors replacement] No path object found for "${hrefFileName}"${
              fileName ? ` in ${lang} - ${fileName}.` : "."
            }`
          );
          return match; // TODO if the file doesn't exist then the anchor should be removed.
        }
      } else {
        console.log(
          `[HTML anchors replacement] Skipped "${trimmedHref}"${
            fileName ? ` in ${lang} - ${fileName}.` : "."
          } It has a '/' and only same directoy files are processed.`
        );
        return match; // TODO if the file doesn't exist then the anchor should be removed.
      }
    } else {
      return match;
    }
  });
}

exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions;

  const typeDefs = `
    type LandsDesignDoc implements Node {
      name: String!
      lang: String!
      htmlContent: String!
    }
    type DocsIndex implements Node {
      lang: String!
      items: [IndexItem]!
    }
    type IndexItem {
      label: String!
      url: String!
      items: [IndexItem]
    }
  `;

  createTypes(typeDefs);
};

exports.onCreateNode = async ({
  node,
  loadNodeContent,
  createNodeId,
  getNode,
  actions,
  createContentDigest,
  reporter,
  cache,
}) => {
  const { createNode, createNodeField } = actions;
  // Add the data about the doc image files to be used later when creating
  // the html doc nodes.
  if (
    node.sourceInstanceName === "docImages" &&
    node.internal.mediaType?.startsWith("image/") &&
    supportedExtensions[node.extension]
  ) {
    let fluidResult = await fluid({ file: node, args: {}, reporter, cache });
    imagesData.push({
      relativePath: node.relativePath.toLowerCase(),
      src: fluidResult.src,
    });
  }

  if (node.internal.type === "IndexXml") {
    const parent = getNode(node.parent);
    const langCode = parent.relativeDirectory.toLowerCase();
    // The base path object with the file name and its corresponding url path.
    const baseNodePathObj = {
      file: node.attributes.file,
      // If the current index's item 'file' has been defined as home page in
      // the config its path is set as the root.
      path:
        !firstAsHome && node.attributes.file === config.homeFile
          ? ""
          : slugify(node.attributes.title) + "/",
      // The name (title) of the file in the corresponding language.
      name: node.attributes.title,
    };
    if (indexTree.hasOwnProperty(langCode)) {
      // Add the base path object to the existing array.
      indexTree[langCode].push(baseNodePathObj);
      // Then add all the children if they exist.
      if (node.xmlChildren.length) {
        const pathObjects = [];
        createArrayOfPathObjs(
          node.xmlChildren,
          pathObjects,
          baseNodePathObj.path
        );
        indexTree[langCode].push(...pathObjects);
      }
    } else {
      // If true the root/home page is created with the first file mentioned in the index.xml.
      if (firstAsHome) {
        baseNodePathObj.path = "";
      }
      // Create the new array and start adding the base path object.
      indexTree[langCode] = [baseNodePathObj];
      // Then add all the children if they exist.
      if (node.xmlChildren.length) {
        const pathObjects = [];
        createArrayOfPathObjs(
          node.xmlChildren,
          pathObjects,
          baseNodePathObj.path
        );
        indexTree[langCode].push(...pathObjects);
      }
    }

    /****************** Creation of the 'docs index' nodes ******************/

    // Creation of a data structure with all the subitems of the current top
    // level index item (the current node).
    const indexItemSubitems = [];
    if (node.xmlChildren.length) {
      createStructureOfItems(
        node.xmlChildren,
        indexItemSubitems,
        baseNodePathObj.path
      );
    }

    const indexTopLevelItem = {
      // TODO Pass also the attr.file in lowercase to use as id or react key in the DOM?
      label: node.attributes.title,
      url: baseNodePathObj.path,
      items: indexItemSubitems,
    };

    // Temporarily stored until all of the items of the same language have been
    // processed and are ready to be used to create an index node.
    if (docsIndexes.hasOwnProperty(langCode)) {
      docsIndexes[langCode].push(indexTopLevelItem);
    } else {
      docsIndexes[langCode] = [indexTopLevelItem];
    }

    // If all the top level index items for that language have been processed
    // then create the parent 'docs index' node that will contain them.
    if (docsIndexes[langCode].length >= parent.children.length) {
      const docsIndexId = createNodeId(langCode + "DocsIndex");
      createNode({
        id: docsIndexId,
        lang: langCode,
        parent: parent.id, // Parent/child relationship should be set when possible otherwise Gatsby will garbage collect the new node.
        internal: {
          type: "DocsIndex",
          contentDigest: createContentDigest(docsIndexes[langCode]),
        },
        items: docsIndexes[langCode],
      });
    }
  }

  // Creation of the HTML doc nodes.
  if (
    node.sourceInstanceName === "doc" &&
    node.internal.mediaType === "text/html"
  ) {
    // Regular expression to match the lang directory name.
    const langRegexp = /^(?<lang>[^/]+)\//;
    // 'relativeDirectory' would be something like: 'de-DE/html'
    const match = langRegexp.exec(node.relativeDirectory);
    let lang = "";
    if (match && match.groups.lang) {
      lang = match.groups.lang.toLowerCase();
    }

    // Read the raw html content.
    const htmlContent = await loadNodeContent(node);

    // Process to replace the images src in the source HTML.
    const processedHtml = htmlContent.replace(imgSrcRegex, (match, p1) => {
      const lowerCaseSrc = p1.trim().toLowerCase();
      if (lowerCaseSrc.startsWith("../images/")) {
        const pathWithLang = lowerCaseSrc.replace("../", lang + "/");
        const imageData = imagesData.find(
          image => image.relativePath === pathWithLang
        );
        if (imageData) {
          return match.replace(p1, imageData.src);
        } else {
          // If here means that the image is not language specific and could be in the common folder.
          const pathWithCommon = lowerCaseSrc.replace("../", "common/");
          const imageData = imagesData.find(
            image => image.relativePath === pathWithCommon
          );
          if (imageData) {
            return match.replace(p1, imageData.src);
          } else {
            reporter.warn(
              `No src replaced for "${p1}", check the image in ${node.relativePath}`
            );
            return match;
          }
        }
      } else {
        reporter.info("Skiped image with src: " + p1);
        // TODO Add here also: return match;
      }
    });

    // Set up the new Lands Design Doc node.
    const htmlNode = {
      id: createNodeId(node.relativePath),
      htmlContent: processedHtml,
      name: node.name, // The file's name. TODO call this fileName.
      lang,
      parent: node.id, // Parent/child relationship should be set when possible otherwise Gatsby will garbage collect the new node.
      internal: {
        type: "LandsDesignDoc",
        contentDigest: createContentDigest(processedHtml),
      },
    };

    createNode(htmlNode);
  }
};

// Called once after the sourcing phase has finished creating nodes.
exports.sourceNodes = async ({ reporter, cache }) => {
  // I store the indexTree object in cache because all its data is added in the onCreateNode() phase above which is not always
  // run, so when I need it later in the createPages() phase, I have to take it from cache, otherwise the object would be empty.
  if (Object.keys(indexTree).length > 0) {
    await cache.set("indexTree", indexTree);
    reporter.info("Added indexTree to cache.");
  }
};

exports.createResolvers = async ({ createResolvers, reporter, cache }) => {
  // TODO If getting the indexTree from cache causes problems then a node could be created so
  // it can be fetched here with context.nodeModel.runQuery or context.nodeModel.getNodeById
  const cachedIndexTree = await cache.get("indexTree");

  const resolvers = {
    LandsDesignDoc: {
      title: {
        type: "String",
        resolve(source, args, context, info) {
          const pathObj = cachedIndexTree[source.lang].find(
            pathObj => pathObj.file.toLowerCase() === source.name.toLowerCase()
          );
          if (pathObj) {
            return pathObj.name;
          } else {
            reporter.warn(
              `Can't resolve 'title' of doc node created from file: ${source.lang} "${source.name}.html" since it doesn't appear on its index.xml.`
            );
            return "";
          }
        },
      },
      // Replaces the current htmlContent after applying the resolver.
      htmlContent: {
        type: "String",
        resolve(source, args, context, info) {
          // I use the Site node to get the defaultLang data.
          const site = context.nodeModel.getAllNodes({ type: "Site" })[0];
          const defaultLang = site.siteMetadata.defaultLang ?? "";
          // Process to replace the internal anchors href in the source HTML.
          return replaceHTMLAnchorsHref(
            source.htmlContent,
            cachedIndexTree[source.lang],
            source.lang,
            defaultLang,
            source.name
          );
        },
      },
    },
  };
  createResolvers(resolvers);
};

exports.createPages = async ({ graphql, actions, reporter, cache }) => {
  const { createPage } = actions;

  const cachedIndexTree = await cache.get("indexTree");

  // Fetch all the doc pages with info about its id, name and lang.
  const {
    data: {
      allLandsDesignDoc: { nodes: docs },
      site: {
        siteMetadata: { defaultLang },
      },
    },
    errors,
  } = await graphql(`
    query {
      allLandsDesignDoc {
        nodes {
          id
          name
          lang
        }
      }
      site {
        siteMetadata {
          defaultLang
        }
      }
    }
  `);

  if (errors) {
    reporter.panicOnBuild('ERROR: Loading "createPages" query');
  }

  docs.forEach(doc => {
    const docName = doc.name.toLowerCase();
    const docLang = doc.lang;
    // Create an object with the links to the doc translations.
    //   It would be better to create it above in 'onCreateNode' because it could be added to the doc
    //   nodes instead of adding it to the page context, but to do this all the 'index.xml' nodes would
    //   have to be processed before the html doc files, and I couldn't find a way to make this happen.
    //   Maybe it could be done above waiting for the type 'LandsDesignDoc' to pass again at the end.
    const translations = {};
    for (const langCode in cachedIndexTree) {
      if (docLang !== langCode) {
        const translationPathObj = cachedIndexTree[langCode].find(
          pathObj => pathObj.file.toLowerCase() === docName
        );
        if (translationPathObj) {
          translations[langCode] =
            "/" +
            (defaultLang !== langCode ? langCode + "/" : "") +
            translationPathObj.path;
        } else {
          reporter.warn(
            `No translation found for file ${docLang} "${doc.name}.html" in ${langCode}`
          );
        }
      }
    }
    // Gets the object with data (path and file name) about the current doc.
    const pathObj = cachedIndexTree[docLang].find(
      pathObj => pathObj.file.toLowerCase() === docName
    );
    if (pathObj) {
      // The url for the current doc is first created and added to the translations object.
      const pagePath =
        "/" + (defaultLang !== docLang ? docLang + "/" : "") + pathObj.path;
      translations[docLang] = pagePath;
      createPage({
        path: pagePath,
        component: path.resolve("./src/templates/doc.js"),
        context: {
          id: doc.id,
          translations,
        },
      });
    } else {
      reporter.warn(
        `Page "${doc.name}.html" ${docLang} could not be created since it doesn't appear in "index.xml" ${docLang}`
      );
    }
  });

  // If no defaultLang has been set then all locales will be visible and a default root page is created to redirect.
  if (!defaultLang) {
    createPage({
      path: "/",
      component: path.resolve("./src/templates/index.js"),
    });
  }
};
