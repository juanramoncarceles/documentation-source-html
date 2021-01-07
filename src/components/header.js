import { Link } from "gatsby";
import PropTypes from "prop-types";
import React from "react";

import LandsLogo from "./lands-logo";
import Language from "./language";

const Header = ({ siteTitle }) => (
  <header className="sticky top-0 z-50 bg-gray-100">
    <div className="mx-auto flex h-20 py-3 lg:w-11/12">
      <div className="flex items-center w-64">
        <Link to="/" aria-label="Link to home page">
          <span className="sr-only">{siteTitle}</span>
          <LandsLogo rootCssClasses="w-auto h-10" />
        </Link>
      </div>
      <div className="flex-auto flex justify-end items-center">
        <Language />
      </div>
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
