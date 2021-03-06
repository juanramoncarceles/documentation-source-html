import React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";

const IndexItem = ({ item, collapsementState, onClick }) => {
  const collapsed = collapsementState[item.id].collapsed;
  const subItems = item.items;

  return (
    <li>
      <span className="flex items-center">
        {subItems && subItems.length ? (
          <button
            className="absolute focus:outline-none"
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
          to={item.url}
          activeClassName="active-index-item"
          className="w-full ml-6 py-0.5 px-1.5 break-all hover:bg-gray-100"
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
              key={item.label}
              onClick={onClick}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

IndexItem.propTypes = {
  item: PropTypes.object.isRequired,
  collapsementState: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default IndexItem;
