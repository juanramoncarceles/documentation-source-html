import React from "react";
import PropTypes from "prop-types";
import { Link, useStaticQuery, graphql } from "gatsby";

import { useIntl } from "../contexts/IntlContext";

import LandsLogo from "./lands-logo";
import Language from "./language";
import Search from "./search";

const searchIndices = [{ name: `Docs`, title: `Docs` }];

const Header = ({ siteTitle }) => {
  const { lang } = useIntl();

  const {
    site: {
      siteMetadata: { defaultLang },
    },
  } = useStaticQuery(graphql`
    query HeaderDefaultLangQuery {
      site {
        siteMetadata {
          defaultLang
        }
      }
    }
  `);

  return (
    <header className="sticky top-0 z-50 bg-gray-100">
      <div className="flex mx-auto h-20 max-w-screen-xl py-3 px-4">
        <div className="flex items-center w-64">
          <Link
            to={"/" + (lang && defaultLang !== lang ? lang : "")}
            className="overflow-hidden w-9 sm:w-auto"
            aria-label="Link to home page"
          >
            <span className="sr-only">{siteTitle}</span>
            <LandsLogo rootCssClasses="w-auto h-10" />
          </Link>
        </div>
        <div className="flex-auto flex justify-end items-center">
          <Search indices={searchIndices} />
          <Language />
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: ``,
};

export default Header;
