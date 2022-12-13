import { BrowserRouter, useRoutes } from "react-router-dom";
import routes from "./routes";
import "./App.css";

import { ChakraProvider } from "@chakra-ui/react";

import { extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClickToComponent } from "click-to-react-component";
import { useEffect } from "react";

import "@/utils/i18n";

function RouteElement() {
  const element = useRoutes(routes as any);
  return element;
}

const Button = {};

const Modal = {
  defaultProps: {},
};

const theme = extendTheme({
  colors: {
    primary: {
      500: "#000",
    },
  },
  components: {
    Button,
    Modal,
  },
});

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

function APP() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        {process.env.NODE_ENV === "development" ? <ClickToComponent /> : null}
        <ChakraProvider theme={theme}>
          <BrowserRouter>
            <RouteElement />
          </BrowserRouter>
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}

export default APP;
