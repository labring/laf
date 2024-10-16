import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { css, Global } from "@emotion/react";
import { loader } from "@monaco-editor/react";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClickToComponent } from "click-to-react-component";

import "@/utils/i18n";

import UpgradePrompt from "./components/UpgradePrompt";
import useAuthStore from "./pages/auth/store";
import useSiteSettingStore from "./pages/siteSetting";
import theme from "./chakraTheme";
import darkTheme from "./chakraThemeDark";
import { CHAKRA_UI_COLOR_MODE_KEY } from "./constants";
import RouteElement from "./routes";

import "simplebar-react/dist/simplebar.min.css";
import "./App.css";
const GlobalStyles = css`
  .js-focus-visible :focus:not([data-focus-visible-added]) {
    outline: none;
    box-shadow: none;
  }
`;

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      cacheTime: 0,
    },
  },
});

loader.config({
  paths: { vs: "/js/monaco-editor.0.43.0" },
});

const useDocumentTitle = (titleKey: string, defaultTitle: string) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t(titleKey, defaultTitle);
  }, [t, titleKey, defaultTitle]);
};

function APP() {
  const { i18n } = useTranslation();

  useDocumentTitle("app.title", "云开发");

  const getSiteSettings = useSiteSettingStore((state) => state.getSiteSettings);
  const { initProviders } = useAuthStore();

  const [colorMode, setColorMode] = useState(localStorage.getItem(CHAKRA_UI_COLOR_MODE_KEY));
  useEffect(() => {
    function onColorModeChange() {
      const colorMode = localStorage.getItem(CHAKRA_UI_COLOR_MODE_KEY);
      setColorMode(colorMode);
    }
    window.addEventListener("ColorModeChange", onColorModeChange);
    return () => {
      window.removeEventListener("ColorModeChange", onColorModeChange);
    };
  });

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    getSiteSettings();
    initProviders();
  }, [getSiteSettings, i18n.language, initProviders]);

  return (
    <Sentry.ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {process.env.NODE_ENV === "development" ? <ClickToComponent /> : null}
        <ChakraProvider theme={colorMode === "light" ? theme : darkTheme}>
          <Global styles={GlobalStyles} />
          <UpgradePrompt />
          <BrowserRouter>
            <RouteElement />
          </BrowserRouter>
        </ChakraProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

export default APP;
