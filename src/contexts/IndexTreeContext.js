import React, { useState, useEffect, useContext, createContext } from "react";
import { useStaticQuery, graphql } from "gatsby";

const IndexTreeContext = createContext();

const IndexTreeContextProvider = ({ children }) => {
  // GraphQL requires to be explicit about levels of nested data.
  // So if more levels are added to the docs this query should be updated.
  // It could be written nicer by creating an item type like here:
  // https://github.com/graphql/graphql-spec/issues/91#issuecomment-254895093
  // with this: https://www.gatsbyjs.com/docs/schema-customization/
  const {
    allDocsIndex: { nodes: indexes },
    site: {
      siteMetadata: { defaultLang },
    },
  } = useStaticQuery(
    graphql`
      query allIndexQuery {
        allDocsIndex {
          nodes {
            lang
            items {
              label
              originalFile
              url
              items {
                label
                originalFile
                url
                items {
                  label
                  originalFile
                  url
                }
              }
            }
          }
        }
        site {
          siteMetadata {
            defaultLang
          }
        }
      }
    `
  );

  // TODO try instead using inside of the useEffect: const path = typeof window !== 'undefined' ? window.location.pathname : '';
  // To avoid having to use this state which has to be passed to Doc.js.
  const [currentPath, setCurrentPath] = useState();

  // TODO maybe useLayoutEffect() ??
  useEffect(() => {
    // Find in the index tree the item with the currentPath and open all its parents.
    for (const key in collapsementState) {
      let item = collapsementState[key];
      if (item.urls.includes(currentPath)) {
        // Find recursively the parents and set them to true.
        while (item.parent !== "") {
          item = collapsementState[item.parent];
          item.collapsed = false;
        }
        break;
      }
    }
    setCollapsementState(collapsementState);
  }, [currentPath]);

  // TODO useEffect to set/get in localStorage the state of the index?

  // TODO everything related to the index items ids would be better to be handled in gatsby-node
  // so it can be added to the nodes, and here it would be just taken from the query.

  // Processes an index array to add the id to each index item.
  // Index strucutre and original file names should be the same for all languages.
  const addChainedIdToIndexItems = (array, parentLabel = "") => {
    for (let i = 0; i < array.length; i++) {
      const id = parentLabel + array[i].originalFile.toLowerCase();
      array[i].id = id;
      if (array[i].items) {
        addChainedIdToIndexItems(array[i].items, id);
      }
    }
  };

  indexes.forEach(index => {
    addChainedIdToIndexItems(index.items);
  });

  /**
   * Creates an object with a property for each item in the index tree. The property
   * name is the item id (a unique identifier of the item in the tree), and the value
   * is an object with 'collapsed', 'urls' and 'parent' properties.
   * @param {Object} outObj An object where all the values will be added.
   * @param {Object[]} itemsArray Array of index items with 'id', 'items' and 'url' fields.
   * @param {string} parentId The name of the key that corresponds to the parent item in the index tree.
   * @param {string} lang The locale to create the urls.
   */
  const createIndexCollapsedStateObj = (outObj, itemsArray, parentId, lang) => {
    itemsArray.forEach(item => {
      // TODO url should be already complete instead than creating it here
      const url = "/" + lang + "/" + item.url;
      if (outObj[item.id]) {
        outObj[item.id].urls.push(url);
      } else {
        outObj[item.id] = { collapsed: true, urls: [url], parent: parentId };
      }
      if (item.items?.length) {
        createIndexCollapsedStateObj(outObj, item.items, item.id, lang);
      }
    });
  };

  const [collapsementState, setCollapsementState] = useState(() => {
    const obj = {};
    indexes.forEach(index => {
      // TODO url should already include the locale instead of passing it.
      createIndexCollapsedStateObj(obj, index.items, "", index.lang);
    });
    return obj;
  });

  return (
    <IndexTreeContext.Provider
      value={{
        indexes,
        collapsementState,
        setCollapsementState,
        setCurrentPath,
        defaultLang,
      }}
    >
      {children}
    </IndexTreeContext.Provider>
  );
};

const useIndexTree = () => {
  const context = useContext(IndexTreeContext);
  if (context === undefined) {
    throw new Error("useIndexTree must be within a IndexTreeContextProvider");
  }
  return context;
};

export { IndexTreeContextProvider, useIndexTree };
