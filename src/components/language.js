import React, { useContext } from "react";
import { navigate } from "gatsby";

import { IntlContext } from "../contexts/IntlContext";

// TODO fetch this from somewhere...
const strings = {
  "es-es": "Español",
  "en-us": "English",
  "it-it": "Italiano",
  "de-de": "Deutsch",
  "fr-fr": "Français",
};

const Language = () => {
  const { lang, storeLang, translations } = useContext(IntlContext);

  /**
   * Creates the list of JSX options.
   * @param {Object} translationsData Keys are the lang codes and values are the urls.
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

  return (
    <div>
      <label htmlFor="lang" className="visually-hidden">
        Language
      </label>
      <select
        name="lang"
        id="lang"
        value={lang}
        onChange={e => {
          const lang = e.target.value;
          navigate(`/${translations[lang]}`);
          storeLang(lang);
        }}
      >
        {createLangOptions(translations)}
      </select>
    </div>
  );
};

export default Language;
