import React from "react";
import PropTypes from "prop-types";

import { useIndexTree } from "../contexts/IndexTreeContext";

import IndexItem from "./indexItem";

const Index = ({ lang, cssClasses }) => {
  const { indexes, collapsementState, setCollapsementState } = useIndexTree();

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
      <nav className="sticky h-(screen-20) pt-10 px-2 top-20 overflow-y-auto border-r">
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
