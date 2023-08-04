import React from "react";
import ReactDOM from "react-dom/client";

import "focus-visible/dist/focus-visible";

import App from "./App";

// polyfill for aws-sdk
if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
