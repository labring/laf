import { lazy, Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { wrapUseRoutes } from "@sentry/react";

import AuthLayout from "@/layouts/Auth";
import BasicLayout from "@/layouts/Basic";
import FunctionLayout from "@/layouts/Function";
import TemplateLayout from "@/layouts/Template";
import useSiteSettingStore, { SiteSettings } from "@/pages/siteSetting";

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
    path: "/bind",
    auth: false,
    children: [
      {
        path: "/bind/github",
        element: () => import("@/pages/auth/bind/BindGitHub"),
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
            path: "/app/:appid/:pageId/:id?/*",
            element: () => import("@/pages/app/index"),
          },
        ],
      },
      {
        path: "/collaboration",
        children: [
          {
            path: "/collaboration/join",
            element: () => import("@/pages/app/collaboration/Invited/index"),
          },
        ],
      },
      {
        path: "/market/templates",
        element: <TemplateLayout />,
        auth: true,
        children: [
          {
            path: "/market/templates/:templateId?",
            element: () => import("@/pages/functionTemplate"),
          },
        ],
      },
      {
        path: "/market/templates/:templateId/edit",
        element: <TemplateLayout />,
        auth: true,
        children: [
          {
            path: "/market/templates/:templateId/edit",
            element: () => import("@/pages/functionTemplate/CreateFuncTemplate"),
          },
        ],
      },
      {
        path: "/market/templates/create",
        element: <TemplateLayout />,
        auth: true,
        children: [
          {
            path: "/market/templates/create",
            element: () => import("@/pages/functionTemplate/CreateFuncTemplate"),
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

function dealRoutes(routesArr: any, siteSettings: SiteSettings) {
  if (routesArr && Array.isArray(routesArr) && routesArr.length > 0) {
    if (siteSettings.enable_web_promo_page?.value === "false") {
      for (let i = 0; i < routesArr.length; i++) {
        const route = routesArr[i];
        if (route.index) {
          routesArr[i] = {
            path: "/",
            element: <BasicLayout />,
            auth: true,
            children: [
              {
                path: "/",
                element: () => import("@/pages/home/index"),
              },
            ],
          };
        }
      }
    }

    routesArr.forEach((route) => {
      if (route.element && typeof route.element == "function") {
        const importFunc = route.element;
        route.element = <LazyElement importFunc={importFunc} />;
      }
      if (route.children) {
        dealRoutes(route.children, siteSettings);
      }
    });
  }
}

function RouteElement() {
  const { siteSettings } = useSiteSettingStore();
  const useSentryRoutes = wrapUseRoutes(useRoutes);

  dealRoutes(routes, siteSettings);
  const element = useSentryRoutes(routes as any);
  return element;
}

export default RouteElement;
