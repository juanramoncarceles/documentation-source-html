import React, { useState, useEffect, useContext, createContext } from "react";
import { navigate, useStaticQuery, graphql } from "gatsby";

const IntlContext = createContext();

/**
 * Stores the locale value in localStorage.
 * @param {string} lang en-us, es-es, it-it, etc...
 */
const storeLang = lang => {
  if (!lang) return;
  try {
    localStorage.setItem("lang", lang);
    console.log(`Stored "${lang}" in Local Storage.`);
  } catch (error) {
    console.error("Error trying to store lang code in Local Storage.", error);
  }
};

const IntlContextProvider = ({ children }) => {
  const [lang, setLang] = useState();
  const [translations, setTranslations] = useState({});

  const {
    site: {
      siteMetadata: { defaultLang },
    },
    allLanguage: { nodes: locales },
  } = useStaticQuery(
    graphql`
      query siteLanguagesQuery {
        site {
          siteMetadata {
            defaultLang
          }
        }
        allLanguage {
          nodes {
            locale
          }
        }
      }
    `
  );

  // TODO Possible method to check the browser lang.
  // const getBrowerLangIfSupported = () => {};

  useEffect(() => {
    let storedLang = localStorage.getItem("lang");
    // Check if the stored locale is valid.
    if (!locales.some(l => l.locale === storedLang)) {
      storedLang = undefined;
      localStorage.removeItem("lang");
    }
    // If there are translations try to use the stored language on them.
    if (Object.keys(translations).length > 0) {
      if (storedLang) {
        navigate(translations[storedLang]);
      }
      // TODO alternatively if there is no stored lang take the one from the browser.
      // else if (getBrowerLangIfSupported()) {
      //   const browserLang = getBrowserLangIfSupported();
      //   navigate(translations[browserLang]);
      // }
    }
    // In this case it is ok to have an object as a dependency since every time new
    // translation values are available a new translations object is created and set.
  }, [translations, locales]);

  return (
    <IntlContext.Provider
      value={{
        lang,
        defaultLang,
        storeLang,
        setLang,
        translations,
        setTranslations,
      }}
    >
      {children}
    </IntlContext.Provider>
  );
};

const useIntl = () => {
  const context = useContext(IntlContext);
  if (context === undefined) {
    throw new Error("useIntl must be used within a IntlContextProvider");
  }
  return context;
};

export { IntlContextProvider, useIntl };
