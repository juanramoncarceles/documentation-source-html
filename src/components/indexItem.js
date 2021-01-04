import React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";

const IndexItem = ({ item, collapsementState, lang, onClick }) => {
  const collapsed = collapsementState[item.id];
  const subItems = item.items;

  return (
    <li>
      <span className="flex items-center">
        {subItems && subItems.length ? (
          <button
            className="absolute"
            aria-label={(collapsed ? "Expand " : "Collapse ") + item.label}
            aria-expanded={collapsed ? "false" : "true"}
            onClick={() => onClick(item.id)}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1.4em"
              width="1.4em"
              xmlns="http://www.w3.org/2000/svg"
            >
              {collapsed ? (
                <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
              ) : (
                <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" />
              )}
            </svg>
          </button>
        ) : null}
        <Link
          to={"/" + lang + "/" + item.url}
          activeClassName="active-index-item"
          className="ml-6 break-all"
        >
          {item.label}
        </Link>
      </span>
      {subItems && subItems.length && !collapsed ? (
        <ul className="pl-2">
          {subItems.map(item => (
            <IndexItem
              item={item}
              collapsementState={collapsementState}
              lang={lang}
              key={item.label}
              onClick={onClick}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

IndexItem.defaultProps = {
  lang: "",
};

IndexItem.propTypes = {
  item: PropTypes.object.isRequired,
  collapsementState: PropTypes.object.isRequired,
  lang: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default IndexItem;
