import React from "react";
import { useStaticQuery, graphql } from "gatsby";

import IndexItem from "./indexItem";

const Index = ({ lang }) => {
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
              url
              items {
                label
                url
                items {
                  label
                  url
                }
              }
            }
          }
        }
      }
    `
  );

  const getIndexDataByLang = lang => {
    const indexObj = indexes.find(index => index.lang === lang);
    return indexObj && indexObj.items;
  };

  return (
    <nav className="w-64 border-r">
      <h3>Index</h3>
      {getIndexDataByLang(lang) ? (
        <ul>
          {getIndexDataByLang(lang).map(item => (
            <IndexItem item={item} lang={lang} key={item.label} />
          ))}
        </ul>
      ) : (
        `No index found for ${lang}`
      )}
    </nav>
  );
};

export default Index;
