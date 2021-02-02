import React from "react";

import { IntlContextProvider } from "./src/contexts/IntlContext";
import { IndexTreeContextProvider } from "./src/contexts/IndexTreeContext";

/**
 * This file is created to make sure the same structure is reflected in gatsby-browser
 * and gatsby-ssr, otherwise there would be a mismatch between client and server output.
 */

export default ({ element }) => (
  <IntlContextProvider>
    <IndexTreeContextProvider>{element}</IndexTreeContextProvider>
  </IntlContextProvider>
);
