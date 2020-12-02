import React from "react";
import { Link } from "gatsby";

const IndexItem = ({ item, lang }) => {
  // TODO use state to handle if the item is open and the sublist should be rendered, like in the Gatsby docs site.

  return (
    <li>
      <span>
        <Link
          to={"/" + lang + "/" + item.url}
          activeClassName="active-index-item"
        >
          {item.label}
        </Link>
        {/* {item.items && item.items.length ? <button>+</button> : null} */}
      </span>
      {item.items && item.items.length ? (
        <ul>
          {item.items.map(item => (
            <IndexItem item={item} lang={lang} key={item.label} />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

export default IndexItem;
