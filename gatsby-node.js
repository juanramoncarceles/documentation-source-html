const fs = require(`fs-extra`);
const path = require(`path`);
const { fluid } = require(`gatsby-plugin-sharp`);
const { slugify } = require("./src/utils");

// Temporary config that may change and be moved out of this file.
const config = {
  // homeFile: "Introduction", // Optional. If provided it should be a top level index.xml item, otherwise no page will be created at root url.
  processImages: true, // Optional. Set to true to process images by Sharp.
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
 * Includes all the data of the index.xml files from the source files.
 * Each index.xml data is stored in an array identified by a key being its locale.
 * Each array contains an object for each of the 'topic' items in the index.xml,
 * and each object has a 'file' and 'title' fields which correspond to the item's
 * attributes, and a 'path' field with the page url.
 * Example: {lang-code: [{file, title, path}]}
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
 * Copies the file node to the Gatsby's public/static/ folder and returns the new path.
 * @param {Object} file The Gatsby's file node.
 * @param {string} pathPrefix Optional prefix to indicate where to store the files inside the public folder.
 */
async function copyFileToStatic(file, pathPrefix = "") {
  const fileName = `${file.internal.contentDigest}/${file.base}`;

  const publicPath = path.join(process.cwd(), "public", "static", fileName);

  let fileExists;
  try {
    fileExists = await fs.stat(publicPath);
  } catch {
    fileExists = false;
  }

  if (!fileExists) {
    try {
      await fs.copy(file.absolutePath, publicPath, { dereference: true });
    } catch (err) {
      console.error(
        `Error copying file from ${file.absolutePath} to ${publicPath}`,
        err
      );
    }
  }

  return `${pathPrefix}/static/${fileName}`;
}

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
      title: arr[i].attributes.title,
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
      originalFile: arr[i].attributes.file,
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
 * If the anchor points to the same page only the anchor will be left.
 * @param {string} stringHTML Input HTML as a string.
 * @param {Object[]} pathObjsArray An array of objects with at least 'path' and 'file' values.
 * @param {string} lang The lang code of the file.
 * @param {string} defaultLang The default lang code set for the site.
 * @param {string} fileName The name of the HTML file being processed.
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
        // If the link is an anchor in the same page only the anchor is left.
        if (pageAnchor && hrefFileName === fileName.toLowerCase()) {
          return match.replace(p1, pageAnchor);
        } else {
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
      file: String!
      title: String!
      paths: [String]!
      lang: String!
      translations: [JSON]!
      htmlContent: String!
    }
    type DocsIndex implements Node {
      lang: String!
      items: [IndexItem]!
    }
    type IndexItem {
      label: String!
      originalFile: String!
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
    node.internal.mediaType?.startsWith("image/")
  ) {
    const imageData = {};
    // Only if images are set to be processed and their format is supported they
    // are processed, otherwise they are just copied to the `/static` folder.
    if (!config?.processImages || !supportedExtensions[node.extension]) {
      const src = await copyFileToStatic(node);
      imageData.src = src;
    } else {
      const fluidResult = await fluid({
        file: node,
        args: {},
        reporter,
        cache,
      });
      imageData.src = fluidResult.src;
    }
    imageData.relativePath = node.relativePath.toLowerCase();
    imagesData.push(imageData);
  }

  if (node.internal.type === "IndexXml") {
    const parent = getNode(node.parent);
    const langCode = parent.relativeDirectory.toLowerCase();
    // The base path object with the file name and its corresponding url path.
    const baseNodePathObj = {
      // The value of the title attribute, which is language specific.
      title: node.attributes.title,
      // The value of the file attribute.
      file: node.attributes.file,
      // If the current index's item 'file' has been defined as home page in
      // the config its path is set as the root.
      path:
        !firstAsHome && node.attributes.file === config.homeFile
          ? ""
          : slugify(node.attributes.title) + "/",
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
      label: node.attributes.title,
      originalFile: node.attributes.file,
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
      file: node.name,
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
      paths: {
        // The doc paths are resolved here instead than finding it in createPage()
        // so it exists in the node and can be queried for example from Algolia.
        type: ["String"],
        resolve(source, args, context, info) {
          // I use the Site node to get the defaultLang data.
          const site = context.nodeModel.getAllNodes({ type: "Site" })[0];
          const defaultLang = site.siteMetadata.defaultLang ?? "";
          // Get the object with data (path and file name) about the current doc.
          // I use filter to get all the index items that point to the same doc.
          const pathObjs = cachedIndexTree[source.lang].filter(
            pathObj => pathObj.file.toLowerCase() === source.file.toLowerCase()
          );
          // In case at least one path has been found add them.
          if (pathObjs.length > 0) {
            return pathObjs.map(
              pathObj =>
                "/" +
                (defaultLang !== source.lang ? source.lang + "/" : "") +
                pathObj.path
            );
          } else {
            reporter.warn(
              `Can't resolve 'path' of doc node created from file: ${source.lang} "${source.file}.html" since it doesn't appear on its index.xml.`
            );
            return [];
          }
        },
      },
      title: {
        type: "String",
        resolve(source, args, context, info) {
          // If the same file appears more than once in the index.xml with filter() I would get more than one pathObj.
          // However it's ok to get just the first one with find() because the title attribute is expected to be the always
          // the same even if the file appears multiple times. In other words, it won't work as expected if a file appears
          // more than once in the index.xml and each time it has a different title, because it will just pick the first one.
          const pathObj = cachedIndexTree[source.lang].find(
            pathObj => pathObj.file.toLowerCase() === source.file.toLowerCase()
          );
          if (pathObj) {
            return pathObj.title;
          } else {
            reporter.warn(
              `Can't resolve 'title' of doc node created from file: ${source.lang} "${source.file}.html" since it doesn't appear on its index.xml.`
            );
            return "";
          }
        },
      },
      translations: {
        type: ["JSON"], // Type example: [{"en-us": "/interface/", "es-es": "/es-es/interfaz/"}]
        resolve(source, args, context, info) {
          // I use the Site node to get the defaultLang data.
          const site = context.nodeModel.getAllNodes({ type: "Site" })[0];
          const defaultLang = site.siteMetadata.defaultLang ?? "";
          // Loop all indexTree to create the translation objects. There will be a translations object per doc's path.
          const docLang = source.lang;
          const translations = [];
          for (const langCode in cachedIndexTree) {
            // For each lang get all that match by file.
            const translationPathObjArr = cachedIndexTree[langCode].filter(
              pathObj =>
                pathObj.file.toLowerCase() === source.file.toLowerCase()
            );
            if (translationPathObjArr.length > 0) {
              // For each match create a translations object.
              translationPathObjArr.forEach((pathObj, i) => {
                const path = `/${
                  defaultLang !== langCode ? langCode + "/" : ""
                }${pathObj.path}`;
                if (!translations[i]) {
                  translations[i] = {
                    [langCode]: path,
                  };
                } else {
                  translations[i][langCode] = path;
                }
              });
            } else {
              reporter.warn(
                `No translation found for file ${docLang} "${source.file}.html" in ${langCode}`
              );
            }
          }
          return translations;
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
            source.file
          );
        },
      },
    },
  };
  createResolvers(resolvers);
};

exports.createPages = async ({ graphql, actions, reporter, cache }) => {
  const { createPage } = actions;

  // Fetch all the doc pages, and site's defaultLang.
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
          paths
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
    if (doc.paths.length > 0) {
      doc.paths.forEach((docPath, i) => {
        // Path could be empty if the html file was not found in the index tree.
        if (docPath !== "") {
          // Create the Gatsby page.
          createPage({
            path: docPath,
            component: path.resolve("./src/templates/doc.js"),
            context: {
              id: doc.id,
            },
          });
        }
      });
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
