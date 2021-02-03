import React, { createRef, useState } from "react";
import algoliasearch from "algoliasearch/lite";
import { Configure, InstantSearch } from "react-instantsearch-dom";

import { useIntl } from "../../contexts/IntlContext";

import SearchBox from "./search-box";
import SearchResult from "./search-result";
import useClickOutside from "./use-click-outside";

const Search = ({ indices }) => {
  const { lang } = useIntl();
  const rootRef = createRef();
  const [query, setQuery] = useState();
  const [hasFocus, setFocus] = useState(false);
  const searchClient = algoliasearch(
    process.env.GATSBY_ALGOLIA_APP_ID,
    process.env.GATSBY_ALGOLIA_SEARCH_KEY
  );
  useClickOutside(rootRef, () => setFocus(false));

  return (
    <div className="relative my-2.5 mr-6 ml-0" ref={rootRef}>
      <InstantSearch
        searchClient={searchClient}
        indexName={indices[0].name}
        onSearchStateChange={({ query }) => setQuery(query)}
      >
        <Configure restrictSearchableAttributes={[`title_${lang}`]} />
        <SearchBox onFocus={() => setFocus(true)} hasFocus={hasFocus} />
        <SearchResult
          show={query && query.length > 0 && hasFocus}
          indices={indices}
        />
      </InstantSearch>
    </div>
  );
};

export default Search;
