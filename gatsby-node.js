const path = require(`path`);
const { slugify } = require("./src/utils");

global.indexTree = {};

const docsIndexes = {};

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
}) => {
  const { createNode } = actions;

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

  // Set up the new Lands Design Doc node.
  const htmlNode = {
    id: createNodeId(node.relativePath),
    htmlContent: htmlContent,
    name: node.name, // The file's name. TODO call this originalName and set name as the name in lang?
    lang,
    internal: {
      type: "LandsDesignDoc",
      contentDigest: createContentDigest(htmlContent),
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
    query MyQuery {
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
