const path = require(`path`);
const { fluid } = require(`gatsby-plugin-sharp`);
const { slugify } = require("./src/utils");

global.indexTree = {};

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
 * @param {string} bPath The base path, if none empty string.
 * @param {Array} finalArr A reference to the final array.
 */
function createArrayOfPathObjs(arr, bPath, finalArr) {
  for (let i = 0; i < arr.length; i++) {
    const path = bPath + "/" + slugify(arr[i].attributes.title);
    finalArr.push({ file: arr[i].attributes.file, path: path + "/" });
    if (arr[i].children) {
      createArrayOfPathObjs(arr[i].children, path, finalArr);
    }
  }
}

/**
 * Creates the tree of items of a pages index.
 * @param {Array} arr The original array with the data.
 * @param {string} bPath The base path, if none empty string.
 * @param {Array} finalArr The array that will store the output.
 */
function createStructureOfItems(arr, bPath, finalArr) {
  for (let i = 0; i < arr.length; i++) {
    const path = bPath + "/" + slugify(arr[i].attributes.title);
    finalArr.push({
      label: arr[i].attributes.title,
      url: path + "/",
      items: [],
    });
    if (arr[i].children) {
      createStructureOfItems(arr[i].children, path, finalArr[i].items);
    }
  }
}

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
  const { createNode } = actions;
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
    // Create the base path object.
    const baseNodePathObj = {
      file: node.attributes.file,
      path: `${slugify(node.attributes.title)}/`,
    };
    if (global.indexTree.hasOwnProperty(langCode)) {
      // Add the base path object to the existing array.
      global.indexTree[langCode].push(baseNodePathObj);
      // Then add all the children if they exist.
      if (node.xmlChildren.length) {
        const pathObjects = [];
        createArrayOfPathObjs(
          node.xmlChildren,
          slugify(node.attributes.title),
          pathObjects
        );
        global.indexTree[langCode].push(...pathObjects);
      }
    } else {
      // Create the new array and start adding the base path object.
      global.indexTree[langCode] = [baseNodePathObj];
      // Then add all the children if they exist.
      if (node.xmlChildren.length) {
        const pathObjects = [];
        createArrayOfPathObjs(
          node.xmlChildren,
          slugify(node.attributes.title),
          pathObjects
        );
        global.indexTree[langCode].push(...pathObjects);
      }
    }

    /****************** Creation of the 'docs index' nodes ******************/

    // Creation of a data structure with all the subitems of the current top
    // level index item (the current node).
    const indexItemSubitems = [];
    if (node.xmlChildren.length) {
      createStructureOfItems(
        node.xmlChildren,
        slugify(node.attributes.title),
        indexItemSubitems
      );
    }

    const indexTopLevelItem = {
      // TODO Pass also the attr.file in lowercase to use as id or react key in the DOM?
      label: node.attributes.title,
      url: `${slugify(node.attributes.title)}/`,
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
      const docsIndexId = createNodeId(langCode + "docsIndex");
      createNode({
        id: docsIndexId,
        lang: langCode,
        internal: {
          type: "docsIndex",
          contentDigest: createContentDigest(docsIndexes[langCode]),
        },
        items: docsIndexes[langCode],
      });
    }
  }

  // Creation of the HTML doc nodes.
  // TODO Add extra check of sourceInstanceName === 'doc'
  if (node.internal.type !== "File" || node.internal.mediaType !== "text/html")
    return;

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
    name: node.name, // The file's name. TODO call this originalName and set name as the name in lang?
    lang,
    internal: {
      type: "LandsDesignDoc",
      contentDigest: createContentDigest(processedHtml),
    },
  };

  createNode(htmlNode);
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
    //   It would be better to create it above in 'onCreateNode' because it could be added
    //   to the doc nodes, but to do this all the 'index.xml' nodes would have to be processed
    //   before the html doc files, and I couldn't find a way to make this happen.
    //   Maybe it could be done above waiting for the type 'LandsDesignDoc' to pass again at the end.
    const translations = {};
    for (const langCode in global.indexTree) {
      if (docLang !== langCode) {
        const translationPathObj = global.indexTree[langCode].find(
          pathObj => pathObj.file.toLowerCase() === docName
        );
        if (translationPathObj) {
          translations[langCode] = translationPathObj.path;
        } else {
          reporter.warn(
            `No translation found for file ${docLang} "${doc.name}.html" in ${langCode}`
          );
        }
      }
    }
    // The translations data is added to the page context to be used from the page.
    const pathObj = global.indexTree[docLang].find(
      pathObj => pathObj.file.toLowerCase() === docName
    );
    if (pathObj) {
      createPage({
        path: docLang + "/" + pathObj.path,
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
