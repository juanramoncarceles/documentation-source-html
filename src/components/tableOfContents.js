import React from "react";
import PropTypes from "prop-types";

const TableOfContents = ({ data, cssClasses }) => {
  return (
    <div className={cssClasses}>
      <nav className="sticky h-(screen-20) top-20 overflow-y-auto py-6">
        <h2 className="uppercase font-semibold mb-3">On this page</h2>
        {data.length > 0 ? (
          // It would be better if the React 'key' below was the 'id', but the headings don't have it yet.
          <ul>
            {data.map(item => (
              <li key={item.heading}>
                <a href={`#${item.id}`}>{item.heading}</a>
                {item.items?.length > 0 ? (
                  <ul>
                    {item.items.map(subitem => (
                      <li key={subitem.heading}>
                        <a href={`#${subitem.id}`}>{subitem.heading}</a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </nav>
    </div>
  );
};

TableOfContents.defaultProps = {
  data: [],
  cssClasses: "",
};

TableOfContents.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  cssClasses: PropTypes.string,
};

export default TableOfContents;
