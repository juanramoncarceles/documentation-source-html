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

  // Creates an object with all the id of the items as keys and a boolen indicating
  // its collapsed state as value.
  const createIndexCollapsedStateObj = (outObj, array, parentLabel = "") => {
    for (let i = 0; i < array.length; i++) {
      const id = parentLabel + array[i].originalFile.toLowerCase();
      outObj[id] = true;
      if (array[i].items) {
        createIndexCollapsedStateObj(outObj, array[i].items, id);
      }
    }
  };

  const [collapsementState, setCollapsementState] = useState(() => {
    const obj = {};
    createIndexCollapsedStateObj(obj, indexes[0].items);
    return obj;
  });

  return (
    <IndexTreeContext.Provider
      value={{ indexes, collapsementState, setCollapsementState, defaultLang }}
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
