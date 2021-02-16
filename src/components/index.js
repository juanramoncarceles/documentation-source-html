import React, { useRef, useEffect, useLayoutEffect, useMemo } from "react";
import PropTypes from "prop-types";

import { useIndexTree } from "../contexts/IndexTreeContext";

import IndexItem from "./indexItem";

/**
 * Stores the vertical scroll value of the provided element in session storage.
 * @param {Element} domElement
 */
const storeYScroll = domElement => {
  if (domElement)
    sessionStorage.setItem("indexTreeYScroll", domElement.scrollTop);
};

/**
 * From an array of indexes returns the one for the provided language.
 * If no index is found undefined is returned.
 * @param {string} lang en-us, es-es, it-it, etc...
 */
const getIndexDataByLang = (indexes, lang) => {
  const indexObj = indexes.find(index => index.lang === lang);
  return indexObj && indexObj.items;
};

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
  }, [setCurrentPath, currentPath]);

  useLayoutEffect(() => {
    if (indexTreeHTMLContainer.current) {
      const scrollPosition = sessionStorage.getItem("indexTreeYScroll");
      indexTreeHTMLContainer.current.scrollTo(0, scrollPosition || 0);
    }
  }, []);

  // TODO another option instead of useMemo is to pass the index already from context,
  // to do that the lang should be passed to context to do the calculation there.
  const indexData = useMemo(() => getIndexDataByLang(indexes, lang), [
    indexes,
    lang,
  ]);

  const toggleCollapsed = itemId => {
    setCollapsementState(
      c => ((c[itemId].collapsed = !c[itemId].collapsed), { ...c }) // eslint-disable-line no-sequences
    );
  };

  return (
    <div
      className={cssClasses + " bg-black bg-opacity-25 lg:bg-white"}
      onClick={e => (e.target === e.currentTarget ? setOpen(false) : null)}
    >
      <nav
        className="sticky h-(screen-20) top-20 mr-24 pt-10 px-2 overflow-y-auto border-r bg-white lg:mr-0 lg:bg-transparent"
        ref={indexTreeHTMLContainer}
        onClick={() => storeYScroll(indexTreeHTMLContainer.current)}
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
