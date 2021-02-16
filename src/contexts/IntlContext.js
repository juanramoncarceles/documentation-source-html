import React, { useState, useEffect, useContext, createContext } from "react";
import { navigate } from "gatsby";

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
  const [lang, setLang] = useState("");
  const [translations, setTranslations] = useState({});

  // TODO Possible method to check the browser lang.
  // const getBrowerLangIfSupported = () => {};

  useEffect(() => {
    if (Object.keys(translations).length > 0) {
      const lang = localStorage.getItem("lang");
      if (lang) {
        navigate(translations[lang]);
      } else {
        storeLang(lang);
      }
      // else if (getBrowerLangIfSupported()) {
      //   const lang = getBrowserLangIfSupported();
      //   navigate(`/${translations[lang]}`);
      // }
    }
    // In this case it is ok to have an object as a dependency since every time new
    // translation values are available a new translations object is created and set.
  }, [translations]);

  return (
    <IntlContext.Provider
      value={{ lang, storeLang, setLang, translations, setTranslations }}
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
