const path = require(`path`);
const { fluid } = require(`gatsby-plugin-sharp`);
const { slugify } = require("./src/utils");

// Temporary config that may change and be moved out of this file.
const config = {
  // homeFile: "Introduction", // Optional. If provided it should be a top level index.xml item, otherwise no page will be created at root url.
};

let firstAsHome = true;

if (!config.hasOwnProperty("homeFile")) {
  console.log("[Config] Using first file in index.xml files as home pages.");
} else {
  const file = config.homeFile;
  if (file && typeof file === "string" && file.trim()) {
    firstAsHome = false;
  } else {
    console.log("[Config] Not valid 'homeFile' value.");
  }
}

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
      }
    });

    // Set up the new Lands Design Doc node.
    const htmlNode = {
      id: createNodeId(node.relativePath),
      htmlContent: processedHtml,
      name: node.name, // The file's name. TODO call this fileName.
      lang,
      internal: {
        type: "LandsDesignDoc",
        contentDigest: createContentDigest(processedHtml),
      },
    };

    createNode(htmlNode);
  }

  // Since the created LandsDesignDoc nodes are processed at the end, after their corresponding index.xml nodes,
  // the complete info in indexTree can be used here to add to each one of them a new field with the value of the title.
  // If the order fails in the future this should be done below in createPages(), and add the field to the pages context.
  if (node.internal.type === "LandsDesignDoc") {
    // Adding field with the translated name (the title of the contents of the file).
    const pathObj = indexTree[node.lang].find(
      pathObj => pathObj.file.toLowerCase() === node.name.toLowerCase()
    );
    if (pathObj) {
      createNodeField({
        node,
        name: "title",
        value: pathObj.name,
      });
    } else {
      reporter.warn(
        `No 'title' field added to the doc node created from file: ${node.lang} "${node.name}.html" since it doesn't appear on its index.xml.`
      );
    }
  }
};

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  // Fetch all the doc pages with info about its id, name and lang.
  const {
    data: {
      allLandsDesignDoc: { nodes: docs },
    },
  } = await graphql(`
    query {
      allLandsDesignDoc {
        nodes {
          id
          name
          lang
        }
      }
    }
  `);

  docs.forEach(doc => {
    const docName = doc.name.toLowerCase();
    const docLang = doc.lang;
    // Create an object with the links to the doc translations.
    //   It would be better to create it above in 'onCreateNode' because it could be added to the doc
    //   nodes instead of adding it to the page context, but to do this all the 'index.xml' nodes would
    //   have to be processed before the html doc files, and I couldn't find a way to make this happen.
    //   Maybe it could be done above waiting for the type 'LandsDesignDoc' to pass again at the end.
    const translations = {};
    for (const langCode in indexTree) {
      if (docLang !== langCode) {
        const translationPathObj = indexTree[langCode].find(
          pathObj => pathObj.file.toLowerCase() === docName
        );
        if (translationPathObj) {
          translations[langCode] = langCode + "/" + translationPathObj.path;
        } else {
          reporter.warn(
            `No translation found for file ${docLang} "${doc.name}.html" in ${langCode}`
          );
        }
      }
    }
    // Gets the object with data (path and file name) about the current doc.
    const pathObj = indexTree[docLang].find(
      pathObj => pathObj.file.toLowerCase() === docName
    );
    if (pathObj) {
      // The url for the current doc is first created and added to the translations object.
      const pagePath = docLang + "/" + pathObj.path;
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
};
