import React, { useRef, useEffect, useLayoutEffect } from "react";
import PropTypes from "prop-types";

import { useIndexTree } from "../contexts/IndexTreeContext";

import IndexItem from "./indexItem";

const Index = ({ lang, setOpen, currentPath, cssClasses }) => {
  const indexTreeHTMLContainer = useRef(null);

  const {
    indexes,
    collapsementState,
    setCollapsementState,
    setCurrentPath,
  } = useIndexTree();

  useEffect(() => {
    setCurrentPath(currentPath);
  });

  useLayoutEffect(() => {
    if (indexTreeHTMLContainer.current) {
      const scrollPosition = sessionStorage.getItem("indexTreeYScroll");
      indexTreeHTMLContainer.current.scrollTo(0, scrollPosition || 0);
    }
  }, []);

  const storeYScroll = () => {
    if (indexTreeHTMLContainer.current)
      sessionStorage.setItem(
        "indexTreeYScroll",
        indexTreeHTMLContainer.current.scrollTop
      );
  };

  const getIndexDataByLang = lang => {
    const indexObj = indexes.find(index => index.lang === lang);
    return indexObj && indexObj.items;
  };

  const indexData = getIndexDataByLang(lang);

  const toggleCollapsed = itemId => {
    collapsementState[itemId].collapsed = !collapsementState[itemId].collapsed;
    setCollapsementState({ ...collapsementState });
  };

  return (
    <div
      className={cssClasses + " bg-black bg-opacity-25 lg:bg-white"}
      onClick={e => (e.target === e.currentTarget ? setOpen(false) : null)}
    >
      <nav
        className="sticky h-(screen-20) top-20 mr-24 pt-10 px-2 overflow-y-auto border-r bg-white lg:mr-0 lg:bg-transparent"
        ref={indexTreeHTMLContainer}
        onClick={storeYScroll}
      >
        {/* <h3 className="text-xl uppercase">Index</h3> */}
        {indexData ? (
          <ul className="mb-10">
            {indexData.map(item => (
              <IndexItem
                item={item}
                collapsementState={collapsementState}
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
  currentPath: PropTypes.string.isRequired,
  cssClasses: PropTypes.string,
};

export default Index;
