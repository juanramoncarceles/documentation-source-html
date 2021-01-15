import React, { useState } from "react";
import { Link } from "gatsby";

const IndexItem = ({ item, lang, defaultLang }) => {
  // TODO This state maybe should be in the parent to avoid that it closes after rerendering the list.
  const [open, setOpen] = useState(false);

  const subItems = item.items;

  return (
    <li>
      <span className="flex items-center">
        {subItems && subItems.length ? (
          <button
            className="absolute"
            aria-label={(open ? "Collapse " : "Expand ") + item.label}
            aria-expanded={open ? "true" : "false"}
            onClick={() => setOpen(!open)}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1.4em"
              width="1.4em"
            >
              {open ? (
                <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" />
              ) : (
                <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
              )}
            </svg>
          </button>
        ) : null}
        <Link
          to={"/" + (defaultLang !== lang ? lang + "/" : "") + item.url}
          activeClassName="active-index-item"
          className="ml-6 break-all"
        >
          {item.label}
        </Link>
      </span>
      {subItems && subItems.length && open ? (
        <ul className="pl-2">
          {subItems.map(item => (
            <IndexItem
              item={item}
              lang={lang}
              defaultLang={defaultLang}
              key={item.label}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

export default IndexItem;
