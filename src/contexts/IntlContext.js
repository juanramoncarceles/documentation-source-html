import React, { useState, useEffect, createContext } from "react";
import { navigate } from "gatsby";

// TODO is it necessary to have an initial state?
const initialState = {
  locale: "en-us",
  storeLang: () => {},
  translations: {},
};

const IntlContext = createContext(initialState);

const IntlContextProvider = ({ children }) => {
  const [lang, setLang] = useState(initialState.locale);
  const [translations, setTranslations] = useState(initialState.translations);

  console.log("LANG: ", lang);
  console.log("TRANSLATIONS: ", translations);

  const storeLang = lang => {
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
        console.log("EFFECT TRANSLATIONS ", `/${translations[lang]}`);
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

export { IntlContext, IntlContextProvider };
