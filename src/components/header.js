import { Link } from "gatsby";
import PropTypes from "prop-types";
import React from "react";

import Language from "./language";

const Header = ({ siteTitle }) => (
  <header className="mb-6 bg-gray-200">
    <div className="mx-auto py-5 lg:w-11/12">
      <h2>
        <Link to="/">{siteTitle}</Link>
      </h2>
      <Language />
    </div>
  </header>
);

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: ``,
};

export default Header;
