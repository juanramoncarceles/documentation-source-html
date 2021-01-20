import React from "react";
import PropTypes from "prop-types";
import { useStaticQuery, graphql } from "gatsby";

import IndexItem from "./indexItem";

const Index = ({ lang, setOpen, cssClasses }) => {
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
        site {
          siteMetadata {
            defaultLang
          }
        }
      }
    `
  );
  // Getting the lang and defaultLang above could be avoided if the paths were
  // created already with the lang in gatsby-node's DocsIndex 'baseNodePathObj'

  const getIndexDataByLang = lang => {
    const indexObj = indexes.find(index => index.lang === lang);
    return indexObj && indexObj.items;
  };

  return (
    <div
      className={cssClasses + " bg-black bg-opacity-25 lg:bg-white"}
      onClick={e => (e.target === e.currentTarget ? setOpen(false) : null)}
    >
      <nav className="sticky h-(screen-20) mr-24 pt-10 px-2 top-20 overflow-y-auto border-r bg-white lg:mr-0 lg:bg-transparent">
        {/* <h3 className="text-xl uppercase">Index</h3> */}
        {getIndexDataByLang(lang) ? (
          <ul>
            {getIndexDataByLang(lang).map(item => (
              <IndexItem
                item={item}
                lang={lang}
                defaultLang={defaultLang}
                key={item.label}
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
  setOpen: () => {},
  cssClasses: "",
};

Index.propTypes = {
  lang: PropTypes.string,
  setOpen: PropTypes.func,
  cssClasses: PropTypes.string,
};

export default Index;
