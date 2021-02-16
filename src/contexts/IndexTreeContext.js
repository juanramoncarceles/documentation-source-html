import React, { useState, useEffect, useContext, createContext } from "react";
import { useStaticQuery, graphql } from "gatsby";

const IndexTreeContext = createContext();

/**
 * Creates an object with a property for each item in the index tree. The property
 * name is the item id (a unique identifier of the item in the tree), and the value
 * is an object with 'collapsed', 'urls' and 'parent' properties.
 * @param {Object} outObj An object where all the values will be added.
 * @param {Object[]} itemsArray Array of index items with 'id', 'items' and 'url' fields.
 * @param {string} parentId The name of the key that corresponds to the parent item in the index tree.
 */
const createIndexCollapsedStateObj = (outObj, itemsArray, parentId) => {
  itemsArray.forEach(item => {
    if (outObj[item.id]) {
      outObj[item.id].urls.push(item.url);
    } else {
      outObj[item.id] = {
        collapsed: true,
        urls: [item.url],
        parent: parentId,
      };
    }
    if (item.items?.length) {
      createIndexCollapsedStateObj(outObj, item.items, item.id);
    }
  });
};

const IndexTreeContextProvider = ({ children }) => {
  // GraphQL requires to be explicit about levels of nested data.
  // So if more levels are added to the docs this query should be updated.
  // It could be written nicer by creating an item type like here:
  // https://github.com/graphql/graphql-spec/issues/91#issuecomment-254895093
  // with this: https://www.gatsbyjs.com/docs/schema-customization/
  const {
    allDocsIndex: { nodes: indexes },
  } = useStaticQuery(
    graphql`
      query allIndexQuery {
        allDocsIndex {
          nodes {
            lang
            items {
              label
              originalFile
              id
              url
              items {
                label
                originalFile
                id
                url
                items {
                  label
                  originalFile
                  id
                  url
                }
              }
            }
          }
        }
      }
    `
  );

  // TODO try instead using inside of the useEffect: const path = typeof window !== 'undefined' ? window.location.pathname : '';
  // To avoid having to use this state which has to be passed to Doc.js.
  const [currentPath, setCurrentPath] = useState();

  const [collapsementState, setCollapsementState] = useState(() => {
    const obj = {};
    indexes.forEach(index => {
      createIndexCollapsedStateObj(obj, index.items, "");
    });
    return obj;
  });

  // TODO maybe useLayoutEffect() ??
  useEffect(() => {
    setCollapsementState(c => {
      // Find in the index tree the item with the currentPath and open all its parents.
      for (const key in c) {
        let item = c[key];
        if (item.urls.includes(currentPath)) {
          // Find recursively the parents and set them to true.
          while (item.parent !== "") {
            item = c[item.parent];
            item.collapsed = false;
          }
          break;
        }
      }
      return c;
    });
  }, [currentPath]);

  // TODO useEffect to set/get in localStorage the state of the index?

  return (
    <IndexTreeContext.Provider
      value={{
        indexes,
        collapsementState,
        setCollapsementState,
        setCurrentPath,
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
