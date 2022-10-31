import "./globals.css";
import { appWithTranslation } from "next-i18next";

import { ChakraProvider } from "@chakra-ui/react";

// 1. Import the extendTheme function
import { extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BasicLayout from "@/layout/Basic";
import { NextPage } from "next";
import { ReactElement, ReactNode } from "react";
import { AppProps } from "next/app";

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

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        {getLayout(<Component {...pageProps} />)}
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(APP);
