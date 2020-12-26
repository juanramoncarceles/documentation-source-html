import React, { useState, useEffect, useContext, createContext } from "react";
import { navigate } from "gatsby";

const IntlContext = createContext();

const IntlContextProvider = ({ children }) => {
  const [lang, setLang] = useState("");
  const [translations, setTranslations] = useState({});

  const storeLang = lang => {
    if (!lang) return;
    try {
      localStorage.setItem("lang", lang);
      console.log(`Stored "${lang}" in Local Storage.`);
    } catch (error) {
      console.error("Error trying to store lang code in Local Storage.", error);
    }
  };

  // TODO Possible method to check the browser lang.
  // const getBrowerLangIfSupported = () => {};

  useEffect(() => {
    if (Object.keys(translations).length > 0) {
      const lang = localStorage.getItem("lang");
      if (lang) {
        navigate(`/${translations[lang]}`);
      } else {
        storeLang(lang);
      }
      // else if (getBrowerLangIfSupported()) {
      //   const lang = getBrowserLangIfSupported();
      //   navigate(`/${translations[lang]}`);
      // }
    }
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
