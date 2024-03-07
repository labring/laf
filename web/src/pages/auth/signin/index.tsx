import { useEffect, useState } from "react";
import { Button, Center, Spinner, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { GithubIcon } from "@/components/CommonIcon";
import { Logo, LogoText } from "@/components/LogoIcon";
import { COLOR_MODE, PROVIDER_NAME } from "@/constants";

import LoginByEmailPanel from "./mods/LoginByEmailPanel";
import LoginByPasswordPanel from "./mods/LoginByPasswordPanel";
import LoginByPhonePanel from "./mods/LoginByPhonePanel";

import useAuthStore from "@/pages/auth/store";
import useGlobalStore from "@/pages/globalStore";

export type providersTypes =
  | PROVIDER_NAME.EMAIL
  | PROVIDER_NAME.GITHUB
  | PROVIDER_NAME.PHONE
  | PROVIDER_NAME.PASSWORD;

export default function SignIn() {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;
  const { githubProvider, passwordProvider, phoneProvider, emailProvider, defaultProvider } =
    useAuthStore();
  const [currentProvider, setCurrentProvider] = useState<providersTypes>();

  const isBindGithub = !!sessionStorage.getItem("githubToken");
  const { showInfo } = useGlobalStore();

  useEffect(() => {
    setCurrentProvider(defaultProvider.name);
  }, [defaultProvider]);

  useEffect(() => {
    if (isBindGithub) {
      showInfo(t("AuthPanel.PleaseBindUser"), 5000, true);
    }
  }, [isBindGithub, showInfo]);

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
      {isBindGithub ? (
        <div className="mb-10 text-[22px] font-semibold text-grayModern-700">
          {t("AuthPanel.BindGitHub")}
        </div>
      ) : (
        <div className="mb-9 flex items-center space-x-4">
          <Logo size="43px" outerColor="#33BABB" innerColor="white" />
          <LogoText size="51px" color={darkMode ? "#33BABB" : "#363C42"} />
        </div>
      )}

      {currentProvider ? (
        <div>
          {currentProvider === PROVIDER_NAME.PHONE ? (
            <LoginByPhonePanel
              showPasswordSigninBtn={!!passwordProvider}
              switchLoginType={() => setCurrentProvider(PROVIDER_NAME.PASSWORD)}
              isDarkMode={darkMode}
            />
          ) : currentProvider === PROVIDER_NAME.EMAIL ? (
            <LoginByEmailPanel
              showPasswordSigninBtn={!!passwordProvider}
              switchLoginType={() => setCurrentProvider(PROVIDER_NAME.PASSWORD)}
              isDarkMode={darkMode}
            />
          ) : currentProvider === PROVIDER_NAME.PASSWORD ? (
            <LoginByPasswordPanel
              showSignupBtn={!!passwordProvider?.register}
              showPhoneSigninBtn={!!phoneProvider}
              showEmailSigninBtn={!!emailProvider}
              setCurrentProvider={setCurrentProvider}
              isDarkMode={darkMode}
            />
          ) : null}

          {!isBindGithub && githubProvider && (
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
                  window.location.href = `v1/auth/github/jump_login?redirectUri=${encodeURIComponent(
                    window.location.origin,
                  )}/bind/github`;
                }}
              >
                <GithubIcon className="mr-4" fontSize="18" />
                {t("AuthPanel.LoginWithGithub")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Center className="h-[310px]">
          <Spinner />
        </Center>
      )}
    </div>
  );
}
