import React, { useState } from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";

import IndexItem from "./indexItem";

const Index = ({ lang, cssClasses }) => {
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
      }
    `
  );

  // TODO everything related to the items ids would be better in gatsby-node so it can be just taken from the query.
  // Processes an index array to add the id to each index item (index should be the same for langs).
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

  const getIndexDataByLang = lang => {
    const indexObj = indexes.find(index => index.lang === lang);
    return indexObj && indexObj.items;
  };

  const indexData = getIndexDataByLang(lang);

  const toggleCollapsed = itemId => {
    collapsementState[itemId] = !collapsementState[itemId];
    setCollapsementState({ ...collapsementState });
  };

  return (
    <div className={cssClasses}>
      <nav className="sticky h-(screen-20) top-20 overflow-y-auto border-r">
        {/* <h3 className="text-xl uppercase">Index</h3> */}
        {indexData ? (
          <ul>
            {indexData.map((item, i) => (
              <IndexItem
                item={item}
                collapsementState={collapsementState}
                lang={lang}
                key={item.label}
                onClick={toggleCollapsed}
              />
            ))}
          </ul>
        ) : (
          `No index found for ${lang}`
        )}
      </nav>
    </div>
  );
};

Index.defaultProps = {
  lang: "",
  cssClasses: "",
};

Index.propTypes = {
  lang: PropTypes.string,
  cssClasses: PropTypes.string,
};

export default Index;
