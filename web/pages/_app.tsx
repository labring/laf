import { ReactElement, ReactNode, useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
// 1. Import the extendTheme function
import { extendTheme } from "@chakra-ui/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClickToComponent } from "click-to-react-component";
import { NextPage } from "next";
import { AppProps } from "next/app";
import Head from "next/head";

import { activate } from "@/utils/i18n";

import "./globals.css";

import BasicLayout from "@/layout/Basic";

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    50: "#000",
    100: "#000",
    500: "#38A169",
  },
};

const theme = extendTheme({ colors });

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

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function APP({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <BasicLayout>{page}</BasicLayout>);

  useEffect(() => {
    // Activate the default locale on page load
    activate("zh-CN");
  }, []);

  return (
    <>
      <Head>
        <title>laf cloud</title>
      </Head>
      <I18nProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          {process.env.NODE_ENV === "development" ? <ClickToComponent /> : null}
          <ChakraProvider theme={theme}>{getLayout(<Component {...pageProps} />)}</ChakraProvider>
        </QueryClientProvider>
      </I18nProvider>
    </>
  );
}

export default APP;
