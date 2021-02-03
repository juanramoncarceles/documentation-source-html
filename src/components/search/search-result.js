import React from "react";
import { Link } from "gatsby";
import {
  connectStateResults,
  connectHighlight,
  Hits,
  Index,
  Snippet,
  connectPoweredBy,
} from "react-instantsearch-dom";

import AlgoliaLogo from "./algolia-logo";

import { useIntl } from "../../contexts/IntlContext";

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

const CustomHighlight = connectHighlight(({ highlight, attribute, hit }) => {
  const parsedHit = highlight({
    highlightProperty: "_highlightResult",
    attribute,
    hit,
  });

  return (
    <span>
      {parsedHit.map((part, index) =>
        part.isHighlighted ? (
          <mark key={index} className="bg-green-light">
            {part.value}
          </mark>
        ) : (
          <span key={index}>{part.value}</span>
        )
      )}
    </span>
  );
});

const CustomPoweredBy = connectPoweredBy(({ url }) => (
  <div className="flex justify-end items-center mt-3.5 text-xs">
    <a
      href={url}
      target="_blank"
      aria-label="Algolia"
      rel="noopener noreferrer"
    >
      <span>Search by</span>
      <AlgoliaLogo className="w-20 ml-1.5" />
    </a>
  </div>
));

const DocHit = ({ hit }) => {
  // TODO it would be better to call this in the SearchResult once instead than for each Hit, maybe with
  // the connectHits: https://www.algolia.com/doc/api-reference/widgets/hits/react/#create-and-instantiate-your-connected-widget
  const { lang } = useIntl();

  return (
    <div className="mb-2 p-1 hover:bg-gray-100">
      <Link to={hit[`path_${lang}`]} className="block">
        <CustomHighlight attribute={`title_${lang}`} hit={hit} />
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
        <Hits
          className="max-h-60-screen overflow-y-auto"
          hitComponent={DocHit}
        />
      </Index>
    ))}
    <CustomPoweredBy />
  </div>
);

export default SearchResult;
