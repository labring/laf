import { useRef, useState } from "react";
import { CheckCircleIcon, ChevronRightIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { Avatar, Box, Divider, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { EditIconLine } from "@/components/CommonIcon";
import { hidePhoneNumber } from "@/utils/format";
import { getAvatarUrl } from "@/utils/getAvatarUrl";

import AvatarEditor from "./Mods/AvatarEditor";
import EmailEditor from "./Mods/EmailEditor";
import PasswordEditor from "./Mods/PasswordEditor";
import PhoneEditor from "./Mods/PhoneEditor";
import UsernameEditor from "./Mods/UsernameEditor";

import "react-image-crop/dist/ReactCrop.css";

import { useGithubAuthControllerUnbindMutation } from "@/pages/auth/service";
import useAuthStore from "@/pages/auth/store";
import useGlobalStore from "@/pages/globalStore";
import useSiteSettingStore from "@/pages/siteSetting";

export default function UserInfo() {
  const [showItem, setShowItem] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { userInfo, updateUserInfo, avatarUpdatedAt, showError, showSuccess } = useGlobalStore(
    (state) => state,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  const { siteSettings } = useSiteSettingStore((state) => state);
  const { phoneProvider, githubProvider, emailProvider } = useAuthStore((state) => state);
  const githubAuthControllerUnbindMutation = useGithubAuthControllerUnbindMutation();

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    setShowItem("avatar");
  };

  const handleBack = () => {
    setShowItem("");
  };

  return (
    <Box className={clsx("flex justify-center pb-4 text-lg", showItem === "" ? "pt-12" : "pt-4")}>
      {showItem === "" && (
        <>
          <Box className="flex flex-col pr-10">
            <Avatar
              size={"xl"}
              name={userInfo?.username}
              src={getAvatarUrl(userInfo?._id, avatarUpdatedAt)}
              bgColor="primary.500"
              color="white"
              boxShadow="base"
            />
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <span
                className="flex cursor-pointer items-center justify-center pt-3 text-base text-grayModern-600"
                onClick={handleClick}
              >
                <EditIconLine color="#5A646E" />
                <span className="ml-1">{t("Edit")}</span>
              </span>
            </div>
          </Box>
          <Box className="w-[270px] pt-1">
            <div className="flex flex-col pb-4">
              <span className={clsx("pb-3 text-xl", !darkMode && "text-grayModern-900")}>
                {t("SettingPanel.UserName")}
              </span>
              <span className="flex justify-between text-base">
                <span className={!darkMode ? "w-[80%] text-grayModern-700" : ""}>
                  {userInfo?.username}
                </span>
                <span
                  className="flex cursor-pointer items-center text-[#0884DD]"
                  onClick={() => {
                    setShowItem("username");
                  }}
                >
                  {t("UserInfo.Change")} <ChevronRightIcon boxSize={5} />
                </span>
              </span>
            </div>
            <div className="flex flex-col pb-4">
              <span className={clsx("pb-3 text-xl", !darkMode && "text-grayModern-900")}>
                {t("SettingPanel.PassWord")}
              </span>
              <span className="flex justify-between text-base">
                <span className={!darkMode ? "text-grayModern-700" : ""}>∗∗∗∗∗∗</span>
                <span
                  className="flex cursor-pointer items-center text-[#0884DD]"
                  onClick={() => {
                    setShowItem("password");
                  }}
                >
                  {t("Reset")} <ChevronRightIcon boxSize={5} />
                </span>
              </span>
            </div>
            <Divider className="mb-4 text-grayModern-200" />
            {phoneProvider && siteSettings.id_verify?.value === "on" && (
              <div className="flex flex-col pb-4">
                <span
                  className={clsx(
                    "flex items-center pb-3 text-xl",
                    !darkMode && "text-grayModern-900",
                  )}
                >
                  {t("SettingPanel.Auth")}
                  {!userInfo?.profile?.idVerified?.isVerified && (
                    <InfoOutlineIcon className="ml-2 !text-primary-600" />
                  )}
                </span>
                <span className="flex justify-between text-base">
                  <span className={!darkMode ? "text-grayModern-700" : ""}>
                    {userInfo?.profile?.idVerified?.isVerified
                      ? userInfo?.profile?.name
                      : t("UserInfo.NoAuth")}
                  </span>
                  {!userInfo?.profile?.idVerified?.isVerified ? (
                    <span
                      className="flex cursor-pointer items-center text-[#0884DD]"
                      onClick={() => {
                        if (userInfo?.phone) {
                          const w = window.open("about:blank");
                          w!.location.href = `${
                            siteSettings.id_verify?.metadata.authenticateSite
                          }?token=${localStorage.getItem("token")}`;
                        } else {
                          showError(t("UserInfo.PleaseBindPhone"));
                          setShowItem("phone");
                        }
                      }}
                    >
                      {t("UserInfo.GotoAuth")} <ChevronRightIcon boxSize={5} />
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="mr-2 text-[#485058]">{t("UserInfo.VerifiedIdentity")}</span>
                      <CheckCircleIcon className="!text-primary-600" />
                    </span>
                  )}
                </span>
              </div>
            )}
            {phoneProvider && (
              <div className="flex flex-col pb-4">
                <span className={clsx("pb-3 text-xl", !darkMode && "text-grayModern-900")}>
                  {t("SettingPanel.Tel")}
                </span>
                <span className="flex justify-between text-base">
                  <span className={!darkMode ? "text-grayModern-700" : ""}>
                    {userInfo?.phone ? hidePhoneNumber(userInfo.phone) : t("NoInfo")}
                  </span>
                  <span
                    className="flex cursor-pointer items-center text-[#0884DD]"
                    onClick={() => {
                      setShowItem("phone");
                    }}
                  >
                    {t("UserInfo.Change")} <ChevronRightIcon boxSize={5} />
                  </span>
                </span>
              </div>
            )}
            {emailProvider && (
              <div className="flex flex-col pb-4">
                <span className={clsx("pb-3 text-xl", !darkMode && "text-grayModern-900")}>
                  {t("SettingPanel.Email")}
                </span>
                <span className="flex justify-between text-base">
                  <span className={!darkMode ? "text-grayModern-700" : ""}>
                    {userInfo?.email ? userInfo?.email : t("NoInfo")}
                  </span>
                  <span
                    className="flex cursor-pointer items-center text-[#0884DD]"
                    onClick={() => {
                      setShowItem("email");
                    }}
                  >
                    {t("UserInfo.Change")} <ChevronRightIcon boxSize={5} />
                  </span>
                </span>
              </div>
            )}
            {githubProvider && (
              <div className="flex flex-col pb-4">
                <span
                  className={clsx(
                    "flex items-center justify-between pb-3 text-xl",
                    !darkMode && "text-grayModern-900",
                  )}
                >
                  <span>Github</span>
                  {userInfo?.github ? (
                    <div className="flex  items-center">
                      <span className="mr-4">
                        <Avatar
                          src={`https://avatars.githubusercontent.com/u/${userInfo?.github}`}
                          size="sm"
                        />
                      </span>
                      <span
                        className={clsx(
                          "flex cursor-pointer items-center text-base",
                          !darkMode && "text-grayModern-900",
                        )}
                        onClick={async () => {
                          const res = await githubAuthControllerUnbindMutation.mutateAsync({});
                          if (!res.error) {
                            updateUserInfo();
                            showSuccess(t("UnBindSuccess"));
                          }
                        }}
                      >
                        {t("UnBind")} <ChevronRightIcon boxSize={5} />
                      </span>
                    </div>
                  ) : (
                    <span
                      className="flex cursor-pointer items-center text-base text-[#0884DD]"
                      onClick={() => {
                        window.location.href = `${window.location.origin}/v1/auth/github/jump_login?redirectUri=${window.location.origin}/bind/github`;
                      }}
                    >
                      {t("Bind")} <ChevronRightIcon boxSize={5} />
                    </span>
                  )}
                </span>
              </div>
            )}
          </Box>
        </>
      )}
      {showItem === "avatar" && <AvatarEditor img={selectedImage} handleBack={handleBack} />}
      {showItem === "username" && <UsernameEditor handleBack={handleBack} />}
      {showItem === "password" && <PasswordEditor handleBack={handleBack} />}
      {showItem === "phone" && <PhoneEditor handleBack={handleBack} />}
      {showItem === "email" && <EmailEditor handleBack={handleBack} />}
    </Box>
  );
}
