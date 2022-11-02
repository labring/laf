import "./globals.css";

import { ChakraProvider } from "@chakra-ui/react";

// 1. Import the extendTheme function
import { extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BasicLayout from "@/layout/Basic";
import { NextPage } from "next";
import { ReactElement, ReactNode, useEffect } from "react";
import { AppProps } from "next/app";

import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { activate } from "@/utils/i18n";
import Head from "next/head";

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    50: "#000",
    100: "#000",
    500: "#000",
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
  const getLayout =
    Component.getLayout ?? ((page) => <BasicLayout>{page}</BasicLayout>);

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
          <ChakraProvider theme={theme}>
            {getLayout(<Component {...pageProps} />)}
          </ChakraProvider>
        </QueryClientProvider>
      </I18nProvider>
    </>
  );
}

export default APP;
