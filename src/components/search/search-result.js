import React from "react";
import { Link } from "gatsby";
import {
  connectStateResults,
  Highlight,
  Hits,
  Index,
  Snippet,
  PoweredBy,
} from "react-instantsearch-dom";

import { useIntl } from "../../contexts/IntlContext";

import styles from "./search-result.module.css";

const HitCount = connectStateResults(({ searchResults }) => {
  const hitCount = searchResults && searchResults.nbHits;

  return (
    <div className="flex justify-center mb-3.5">
      {hitCount > 0
        ? `${hitCount} result${hitCount !== 1 ? "s" : ""}`
        : "No results"}
    </div>
  );
});

const DocHit = ({ hit }) => {
  // TODO it would be better to call this in the SearchResult once instead than for each Hit, maybe with
  // the connectHits: https://www.algolia.com/doc/api-reference/widgets/hits/react/#create-and-instantiate-your-connected-widget
  const { lang } = useIntl();

  return (
    <div className="mb-2 p-1 hover:bg-gray-100">
      <Link to={hit[`path_${lang}`]}>
        <Highlight
          attribute={`title_${lang}`}
          hit={hit}
          tagName="mark"
          className={styles.highlight}
        />
      </Link>
      {/* <Snippet attribute="htmlContent" hit={hit} tagName="mark" /> */}
    </div>
  );
};

const SearchResult = ({ indices, show }) => (
  <div
    className={`mt-2 p-4 absolute right-0 top-full z-10 bg-white shadow-lg max-w-lg w-80-screen ${
      show ? "block" : "hidden"
    }`}
  >
    {indices.map(index => (
      <Index indexName={index.name} key={index.name}>
        <HitCount />
        <Hits className={styles.hits} hitComponent={DocHit} />
      </Index>
    ))}
    <PoweredBy
      className={
        styles.banner + " flex justify-end items-center mt-3.5 text-xs"
      }
    />
  </div>
);

export default SearchResult;
