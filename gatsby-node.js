const path = require(`path`);
const { slugify } = require("./src/utils");

global.indexTree = {};

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

exports.onCreateNode = async ({
  node,
  loadNodeContent,
  createNodeId,
  getNode,
  actions,
  createContentDigest,
}) => {
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
      if (node.xmlChildren) {
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
      if (node.xmlChildren) {
        const pathObjects = [];
        createArrayOfPathObjs(
          node.xmlChildren,
          slugify(node.attributes.title),
          pathObjects
        );
        global.indexTree[langCode].push(...pathObjects);
      }
    }
  }

  // Creation of the HTML doc nodes.
  // TODO Add extra check of sourceInstanceName === 'doc'
  if (node.internal.type !== "File" || node.internal.mediaType !== "text/html")
    return;

  const { createNode } = actions;

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
    const pathObj = global.indexTree[docLang].find(
      pathObj => pathObj.file.toLowerCase() === docName
    );
    if (pathObj) {
      createPage({
        path: docLang + "/" + pathObj.path,
        component: path.resolve("./src/templates/doc.js"),
        context: {
          id: doc.id,
        },
      });
    } else {
      reporter.warn(
        `Page "${doc.name}.html" ${docLang} could not be created since it doesn't appear in "index.xml" ${docLang}`
      );
    }
  });
};
