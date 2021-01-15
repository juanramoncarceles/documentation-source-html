/*
This template will only be used when no 'defaultLang' is specified in the config,
so it will redirect to the first lang that IntlContext provides or English if none.
*/

import { useEffect } from "react";
import { navigate } from "gatsby";

export default () => {
  useEffect(() => {
    navigate("/en-us/");
  }, []);
  return null;
};
