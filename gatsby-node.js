const fs = require(`fs-extra`);
const path = require(`path`);
const { fluid } = require(`gatsby-plugin-sharp`);
const {
  slugify,
  replaceHTMLImagesSrc,
  replaceHTMLAnchorsHref,
} = require("./src/utils");

// Temporary config that may change and be moved out of this file.
const config = {
  // homeFile: "Introduction", // Optional. If provided it should be a top level index.xml item, otherwise no page will be created at root url. Make case insensitive.
  processImages: true, // Optional. Set to true to process images by Sharp.
  defaultLang: "en-us", // TODO take this from gatsby-config instead.
};

// TODO remove and use only homeFile setting it to empty string or null to indicate to use the first as home,
// because currently if homeFile is set to true this is ignored, which could be confusing.
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

/**
 * An object with a key for each language, and each one with a nested array with
 * the index.xml items. Each item has 'label', 'originalFile', 'url' and 'items'.
 */
const docsIndexes = {};

/**
 * Stores all the data about the image files.
 * Array of objects with:
 *  'relativePath': original path to the image file in the source.
 *  'src': final path to the image file to be used.
 */
const imagesData = [];

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
 * Recursively creates the tree of links to the pages.
 * @param {Array} arr The original array with the data.
 * @param {Array} finalArr The array that will store the output.
 * @param {string} bPath Optional. Base path, ending slash will be added if not included.
 * @param {string} parentId Optional. The id of the parent which is used to create the item id.
 */
function createStructureOfItems(arr, finalArr, bPath = "", parentId = "") {
  // In case a base path is provided without ending slash add it.
  if (bPath && !bPath.endsWith("/")) {
    bPath + "/";
  }
  for (let i = 0; i < arr.length; i++) {
    const path = bPath + slugify(arr[i].attributes.title) + "/";
    const id = parentId + arr[i].attributes.file.toLowerCase();
    finalArr.push({
      label: arr[i].attributes.title,
      originalFile: arr[i].attributes.file,
      id,
      url: path,
      items: [],
    });
    if (arr[i].children) {
      createStructureOfItems(arr[i].children, finalArr[i].items, path, id);
    }
  }
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
    /********************* Creation of the 'index trees' *********************/

    const parent = getNode(node.parent);
    const langCode = parent.relativeDirectory.toLowerCase();
    const pathLocalePrefix = `/${
      config.defaultLang !== langCode ? langCode + "/" : ""
    }`;
    // The base path object with the file name and its corresponding url path.
    const baseNodePathObj = {
      // The value of the title attribute, which is language specific.
      title: node.attributes.title,
      // The value of the file attribute.
      file: node.attributes.file,
      // If the current index's item 'file' has been defined as home page in
      // the config its path is set as the root.
      path:
        pathLocalePrefix +
        (!firstAsHome && node.attributes.file === config.homeFile
          ? ""
          : slugify(node.attributes.title) + "/"),
    };

    // If the indexTree has that language already push the pathObj to that
    // array, otherwise create the array with that pathObj.
    if (indexTree.hasOwnProperty(langCode)) {
      indexTree[langCode].push(baseNodePathObj);
    } else {
      // If true the root/home page is created with the first file mentioned in the index.xml.
      if (firstAsHome) {
        baseNodePathObj.path = pathLocalePrefix;
      }
      indexTree[langCode] = [baseNodePathObj];
    }

    // If the top level index.xml item has children create a path object for each child item
    // and add them to the array for that language in indexTree.
    if (node.xmlChildren.length) {
      const pathObjects = [];
      createArrayOfPathObjs(
        node.xmlChildren,
        pathObjects,
        baseNodePathObj.path
      );
      indexTree[langCode].push(...pathObjects);
    }

    /****************** Creation of the 'docs index' nodes ******************/

    // Creation of a data structure with all the subitems of the current top
    // level index item (the current node).
    const indexItemSubitems = [];
    if (node.xmlChildren.length) {
      createStructureOfItems(
        node.xmlChildren,
        indexItemSubitems,
        baseNodePathObj.path,
        baseNodePathObj.file.toLowerCase()
      );
    }

    const indexTopLevelItem = {
      label: node.attributes.title,
      originalFile: node.attributes.file, // TODO rename to file
      id: node.attributes.file.toLowerCase(),
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

  /******************** Creation of the Doc (HTML) nodes ********************/

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

    // Replace the images' src in the source HTML.
    const processedHtml = replaceHTMLImagesSrc(
      htmlContent,
      imagesData,
      lang,
      node.name
    );

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
          // Get the object with data (path and file name) about the current doc.
          // I use filter to get all the index items that point to the same doc.
          const pathObjs = cachedIndexTree[source.lang].filter(
            pathObj => pathObj.file.toLowerCase() === source.file.toLowerCase()
          );
          // In case at least one path has been found add them.
          if (pathObjs.length > 0) {
            return pathObjs.map(pathObj => pathObj.path);
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
                const path = pathObj.path;
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
          // Process to replace the internal anchors href in the source HTML.
          return replaceHTMLAnchorsHref(
            source.htmlContent,
            cachedIndexTree[source.lang],
            source.lang,
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
