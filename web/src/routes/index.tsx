import { lazy, Suspense } from "react";

import BasicLayout from "@/layouts/Basic";
import FunctionLayout from "@/layouts/Function";
import LoginReg from "@/layouts/LoginReg";

const route404 = {
  path: "*",
  element: () => import("@/pages/404"),
};

const routes = [
  {
    path: "/login_callback",
    element: <LoginReg />,
    children: [
      {
        path: "/login_callback",
        element: () => import("@/pages/LoginCallback"),
      },
      route404,
    ],
  },
  {
    path: "/",
    children: [
      {
        path: "/",
        element: <BasicLayout />,
        children: [
          {
            path: "/",
            element: () => import("@/pages/home/index"),
          },
        ],
      },
      {
        path: "/app",
        element: <FunctionLayout />,
        children: [
          {
            path: "/app/:appid/:pageId/:id?",
            element: () => import("@/pages/app/index"),
          },
        ],
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
