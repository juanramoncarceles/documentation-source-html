/* eslint-disable jsx-a11y/no-onchange */

import React from "react";
import { navigate } from "gatsby";

import { useIntl } from "../contexts/IntlContext";

// TODO fetch this from somewhere...
const strings = {
  "es-es": "Español",
  "en-us": "English",
  "it-it": "Italiano",
  "de-de": "Deutsch",
  "fr-fr": "Français",
};

/**
 * Creates the list of JSX options for each language available.
 * @param {Object} translationsData Keys are the lang codes and value is the path {<lang>: <path>}
 */
const createLangOptions = translationsData => {
  const options = [];
  for (const key of Object.keys(translationsData)) {
    options.push(
      <option value={key} key={key}>
        {strings[key]}
      </option>
    );
  }
  return options;
};

const Language = () => {
  const { lang, storeLang, translations } = useIntl();

  return (
    <form className="relative">
      <label htmlFor="lang" className="sr-only">
        Lands Design Help language
      </label>
      <select
        name="lang"
        id="lang"
        className="appearance-none block bg-transparent pr-6 py-1 text-gray-500 font-medium focus:outline-none focus:text-gray-900 cursor-pointer transition-colors duration-200"
        value={lang}
        onChange={e => {
          const lang = e.target.value;
          navigate(translations[lang]);
          storeLang(lang);
        }}
      >
        {createLangOptions(translations)}
      </select>
      <svg
        className="w-5 h-5 text-gray-500 absolute top-1/2 right-0 -mt-2.5 pointer-events-none"
        fill="currentColor"
      >
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    </form>
  );
};

export default Language;
