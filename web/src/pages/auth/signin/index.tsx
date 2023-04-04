import { useEffect, useState } from "react";
import { AiFillGithub } from "react-icons/ai";
import { Button } from "@chakra-ui/react";
import { t } from "i18next";

import LoginByPasswordPanel from "./mods/LoginByPasswordPanel";
import LoginByPhonePanel from "./mods/LoginByPhonePanel";

import { useGetProvidersQuery } from "@/pages/auth/service";
import useAuthStore from "@/pages/auth/store";

type providersTypes = "user-password" | "phone" | "github" | "wechat";

export default function SignIn() {
  const { providers, setProviders } = useAuthStore();
  useGetProvidersQuery((data: any) => {
    setProviders(data?.data || []);
  });
  const [phoneProvider, setPhoneProvider] = useState<any>(null);
  const [passwordProvider, setPasswordProvider] = useState<any>(null);
  const [githubProvider, setGithubProvider] = useState<any>(null);
  const [wechatProvider, setWechatProvider] = useState<any>(null);
  const [currentProvider, setCurrentProvider] = useState<providersTypes>();
  useEffect(() => {
    if (providers.length) {
      const phoneProvider = providers.find((provider: any) => provider.name === "phone");
      const passwordProvider = providers.find((provider: any) => provider.name === "user-password");
      const githubProvider = providers.find((provider: any) => provider.name === "github");

      setPhoneProvider(phoneProvider);
      setPasswordProvider(passwordProvider);
      setGithubProvider(githubProvider);
      setWechatProvider(wechatProvider);
      providers.forEach((provider: any) => {
        if (provider.default) {
          setCurrentProvider(provider.name);
        }
      });
    }
  }, [providers, wechatProvider]);

  return (
    <div className="absolute left-1/2 top-1/2 min-h-[500px] w-[560px] -translate-y-1/2 rounded-[10px] bg-white p-[65px] pb-[100px]">
      <div className="mb-[45px]">
        <img src="/logo_light.png" alt="logo" width={80} className="mr-4" />
      </div>

      {currentProvider === "phone" ? (
        <LoginByPhonePanel
          showPasswordSigninBtn={!!passwordProvider}
          switchLoginType={() => setCurrentProvider("user-password")}
        />
      ) : currentProvider === "user-password" ? (
        <LoginByPasswordPanel
          showSignupBtn={!!passwordProvider?.register}
          showPhoneSigninBtn={!!phoneProvider}
          switchLoginType={() => setCurrentProvider("phone")}
        />
      ) : null}

      {(githubProvider || wechatProvider) && (
        <div className="mt-20">
          <div className="relative mb-5 w-full text-center before:absolute before:top-1/2 before:block before:h-[1px] before:w-full before:bg-slate-300 before:content-['']">
            <span className="relative z-10 bg-white pl-5 pr-5">or</span>
          </div>
          {githubProvider && (
            <Button type="submit" className="w-full pb-5 pt-5" colorScheme="white" variant="plain">
              <AiFillGithub className="mr-4" />
              {t("AuthPanel.LoginWithGithub")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
