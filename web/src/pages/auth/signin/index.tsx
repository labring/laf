import { useEffect, useState } from "react";
import { Button, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { GithubIcon } from "@/components/CommonIcon";
import { Logo, LogoText } from "@/components/LogoIcon";
import { COLOR_MODE } from "@/constants";

import LoginByPasswordPanel from "./mods/LoginByPasswordPanel";
import LoginByPhonePanel from "./mods/LoginByPhonePanel";

import { useGetProvidersQuery } from "@/pages/auth/service";
import useAuthStore from "@/pages/auth/store";

type providersTypes = "user-password" | "phone" | "github" | "wechat";

export default function SignIn() {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;
  const { providers, setProviders } = useAuthStore();
  const [phoneProvider, setPhoneProvider] = useState<any>(null);
  const [passwordProvider, setPasswordProvider] = useState<any>(null);
  const [githubProvider, setGithubProvider] = useState<any>(null);
  const [currentProvider, setCurrentProvider] = useState<providersTypes>();

  useGetProvidersQuery((data: any) => {
    setProviders(data?.data || []);
  });

  useEffect(() => {
    if (providers.length) {
      const phoneProvider = providers.find((provider: any) => provider.name === "phone");
      const passwordProvider = providers.find((provider: any) => provider.name === "user-password");
      const githubProvider = providers.find((provider: any) => provider.name === "github");

      setPhoneProvider(phoneProvider);
      setPasswordProvider(passwordProvider);
      setGithubProvider(githubProvider);
      providers.forEach((provider: any) => {
        if (provider.default) {
          setCurrentProvider(provider.name);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers]);

  return (
    <div
      className={clsx(
        "absolute right-[125px] top-1/2 w-[560px] -translate-y-1/2 rounded-3xl px-16 pb-16 pt-[78px]",
        {
          "bg-lafDark-100": darkMode,
          "bg-[#FCFCFD]": !darkMode,
        },
      )}
    >
      {sessionStorage.getItem("githubToken") && sessionStorage.getItem("githubToken") !== "null" ? (
        <div className="mb-10 text-2xl font-semibold text-grayModern-700">
          {t("AuthPanel.BindGitHub")}
        </div>
      ) : (
        <div className="mb-9 flex items-center space-x-4">
          <Logo size="43px" outerColor="#33BABB" innerColor="white" />
          <LogoText size="51px" color={darkMode ? "#33BABB" : "#363C42"} />
        </div>
      )}

      {currentProvider === "phone" ? (
        <LoginByPhonePanel
          showPasswordSigninBtn={!!passwordProvider}
          switchLoginType={() => setCurrentProvider("user-password")}
          isDarkMode={darkMode}
        />
      ) : currentProvider === "user-password" ? (
        <LoginByPasswordPanel
          showSignupBtn={!!passwordProvider?.register}
          showPhoneSigninBtn={!!phoneProvider}
          switchLoginType={() => setCurrentProvider("phone")}
          isDarkMode={darkMode}
        />
      ) : null}

      {!sessionStorage.getItem("githubToken") && githubProvider && (
        <div className="mt-2">
          <div className="relative mb-5 w-full text-center before:absolute before:top-1/2 before:block before:h-[1px] before:w-full before:bg-[#E9EEF5] before:content-['']">
            <span
              className={clsx(
                "relative z-10 pl-5 pr-5 text-frostyNightfall-600",
                !darkMode ? "bg-white" : "bg-lafDark-100",
              )}
            >
              or
            </span>
          </div>
          <Button
            type="submit"
            className={clsx("w-full pb-5 pt-5", !darkMode && "text-[#495867]")}
            colorScheme="white"
            variant="outline"
            border="1.5px solid #DDE4EF"
            onClick={() => {
              window.location.href = `${window.location.origin}/v1/auth/github/jump_login?redirectUri=${window.location.origin}/bind/github`;
            }}
          >
            <GithubIcon className="mr-4" fontSize="18" />
            {t("AuthPanel.LoginWithGithub")}
          </Button>
        </div>
      )}
    </div>
  );
}
