import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import * as Sentry from "@sentry/react";

import "focus-visible/dist/focus-visible";

import App from "./App";

if (["laf.run", "laf.dev"].includes(window.location.hostname)) {
  const commitId = import.meta.env.VITE_GITHUB_SHA;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    release: `laf@${commitId}`,
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        ),
      }),
      new Sentry.Replay(),
      // new HttpClient(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

// polyfill for aws-sdk
if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
