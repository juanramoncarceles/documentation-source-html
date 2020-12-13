import React from "react";

import "./src/styles/global.css";

import { IntlContextProvider } from "./src/contexts/IntlContext";

export const wrapRootElement = ({ element }) => (
  <IntlContextProvider>{element}</IntlContextProvider>
);
