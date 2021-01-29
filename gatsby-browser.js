import React from "react";

import "./src/styles/global.css";

import { IntlContextProvider } from "./src/contexts/IntlContext";
import { IndexTreeContextProvider } from "./src/contexts/IndexTreeContext";

export const wrapRootElement = ({ element }) => (
  <IntlContextProvider>
    <IndexTreeContextProvider>{element}</IndexTreeContextProvider>
  </IntlContextProvider>
);
