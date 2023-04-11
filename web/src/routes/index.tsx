import { lazy, Suspense } from "react";

import AuthLayout from "@/layouts/Auth";
import BasicLayout from "@/layouts/Basic";
import FunctionLayout from "@/layouts/Function";

const route404 = {
  path: "*",
  element: () => import("@/pages/404"),
};

const routes = [
  {
    path: "/login",
    element: <AuthLayout />,
    auth: false,
    children: [
      {
        path: "/login",
        element: () => import("@/pages/auth/signin"),
      },
    ],
  },
  {
    path: "/signup",
    element: <AuthLayout />,
    auth: false,
    children: [
      {
        path: "/signup",
        element: () => import("@/pages/auth/signup"),
      },
    ],
  },
  {
    path: "/reset-password",
    element: <AuthLayout />,
    auth: false,
    children: [
      {
        path: "/reset-password",
        element: () => import("@/pages/auth/reset-password"),
      },
    ],
  },
  {
    path: "/",
    children: [
      {
        path: "/",
        element: () => import("@/pages/homepage"),
        index: true,
      },
      {
        path: "/dashboard",
        element: <BasicLayout />,
        auth: true,
        children: [
          {
            path: "/dashboard",
            element: () => import("@/pages/home/index"),
          },
        ],
      },
      {
        path: "/app",
        element: <FunctionLayout />,
        auth: true,
        children: [
          {
            path: "/app/:appid/:pageId/:id?",
            element: () => import("@/pages/app/index"),
          },
        ],
      },
      {
        path: "/403",
        element: () => import("@/pages/403"),
      },
      route404,
    ],
  },
];

function LazyElement(props: any) {
  const { importFunc } = props;
  const LazyComponent = lazy(importFunc);
  return (
    <Suspense fallback={null}>
      <LazyComponent />
    </Suspense>
  );
}

function dealRoutes(routesArr: any) {
  if (routesArr && Array.isArray(routesArr) && routesArr.length > 0) {
    routesArr.forEach((route) => {
      if (route.element && typeof route.element == "function") {
        const importFunc = route.element;
        route.element = <LazyElement importFunc={importFunc} />;
      }
      if (route.children) {
        dealRoutes(route.children);
      }
    });
  }
}
dealRoutes(routes);

export default routes;
