import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

// polyfill for aws-sdk
if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
