import React from "react";
import PropTypes from "prop-types";

import { useIndexTree } from "../contexts/IndexTreeContext";

import IndexItem from "./indexItem";

const Index = ({ lang, setOpen, cssClasses }) => {
  const {
    indexes,
    collapsementState,
    setCollapsementState,
    defaultLang,
  } = useIndexTree();

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
    <div
      className={cssClasses + " bg-black bg-opacity-25 lg:bg-white"}
      onClick={e => (e.target === e.currentTarget ? setOpen(false) : null)}
    >
      <nav className="sticky h-(screen-20) mr-24 pt-10 px-2 top-20 overflow-y-auto border-r bg-white lg:mr-0 lg:bg-transparent">
        {/* <h3 className="text-xl uppercase">Index</h3> */}
        {indexData ? (
          <ul>
            {indexData.map(item => (
              <IndexItem
                item={item}
                collapsementState={collapsementState}
                lang={lang}
                defaultLang={defaultLang}
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
  setOpen: () => {},
  cssClasses: "",
};

Index.propTypes = {
  lang: PropTypes.string,
  setOpen: PropTypes.func,
  cssClasses: PropTypes.string,
};

export default Index;
