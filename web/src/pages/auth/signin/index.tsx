import { useState } from "react";
import { AiFillGithub } from "react-icons/ai";
import { Button } from "@chakra-ui/react";
import { t } from "i18next";

import LoginByPasswordPanel from "./mods/LoginByPasswordPanel";
import LoginByPhonePanel from "./mods/LoginByPhonePanel";

export default function SignIn() {
  const [loginType, setLoginType] = useState<"phone" | "password">("password");
  return (
    <div className="bg-white absolute left-1/2 top-1/2 -translate-y-1/2 w-[560px] rounded-[10px] p-[65px] pb-[100px]">
      <div className="mb-[45px]">
        <img src="/logo.png" alt="logo" width={40} className="mr-4" />
      </div>

      {loginType === "phone" ? (
        <LoginByPhonePanel switchLoginType={() => setLoginType("password")} />
      ) : (
        <LoginByPasswordPanel switchLoginType={() => setLoginType("phone")} />
      )}

      <div className="mt-20">
        <div className="w-full text-center mb-5 relative before:content-[''] before:block before:w-full before:h-[1px] before:bg-slate-300 before:absolute before:top-1/2">
          <span className="pl-5 pr-5 bg-white z-10 relative">or</span>
        </div>
        <Button type="submit" className="w-full pt-5 pb-5" colorScheme="white" variant="plain">
          <AiFillGithub className="mr-4" />
          {t("AuthPanel.LoginWithGithub")}
        </Button>
      </div>
    </div>
  );
}
