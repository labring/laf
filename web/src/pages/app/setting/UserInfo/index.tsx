import { useRef, useState } from "react";
import { ChevronRightIcon, EditIcon } from "@chakra-ui/icons";
import { Avatar, Box, Divider } from "@chakra-ui/react";
import { t } from "i18next";

import { hidePhoneNumber } from "@/utils/format";

import AvatarEditor from "./Mods/AvatarEditor";
import EmailEditor from "./Mods/EmailEditor";
import PasswordEditor from "./Mods/PasswordEditor";
import PhoneEditor from "./Mods/PhoneEditor";
import UserNameEditor from "./Mods/UsernameEditor";

import "react-image-crop/dist/ReactCrop.css";

import useGlobalStore from "@/pages/globalStore";

export default function UserInfo() {
  const [showItem, setShowItem] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

  const { userInfo } = useGlobalStore((state) => state);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <Box className="flex justify-center pb-4 text-lg">
      {showItem === "" && (
        <>
          <Box className="flex flex-col pr-10">
            <Avatar
              size={"xl"}
              name={userInfo?.username}
              src={croppedImageUrl || userInfo?.profile?.avatar}
              bgColor="primary.500"
              color="white"
              boxShadow="base"
            />
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <span
                className="flex cursor-pointer items-center justify-center pt-3 text-base text-grayModern-600"
                onClick={handleClick}
              >
                <EditIcon className="mr-1" />
                编辑
              </span>
            </div>
          </Box>
          <Box className="w-[270px]">
            <div className="flex flex-col pb-4">
              <span className="pb-3 text-xl text-grayModern-900">{t("SettingPanel.UserName")}</span>
              <span className="flex justify-between text-base">
                <span className="text-grayModern-700">{userInfo?.username}</span>
                <span
                  className="flex cursor-pointer items-center text-[#0884DD]"
                  onClick={() => {
                    setShowItem("username");
                  }}
                >
                  更改 <ChevronRightIcon boxSize={5} />
                </span>
              </span>
            </div>
            <div className="flex flex-col pb-4">
              <span className="pb-3 text-xl text-grayModern-900">{t("SettingPanel.PassWord")}</span>
              <span className="flex justify-between text-base">
                <span className="text-grayModern-700">******</span>
                <span
                  className="flex cursor-pointer items-center text-[#0884DD]"
                  onClick={() => {
                    setShowItem("password");
                  }}
                >
                  设置 <ChevronRightIcon boxSize={5} />
                </span>
              </span>
            </div>
            <Divider className="text-grayModern-200" />
            <div className="mt-4 flex flex-col pb-4">
              <span className="pb-3 text-xl text-grayModern-900">{t("SettingPanel.Tel")}</span>
              <span className="flex justify-between text-base">
                <span className="text-grayModern-700">
                  {userInfo?.phone ? hidePhoneNumber(userInfo.phone) : t("NoInfo")}
                </span>
                <span
                  className="flex cursor-pointer items-center text-[#0884DD]"
                  onClick={() => {
                    setShowItem("phone");
                  }}
                >
                  更改 <ChevronRightIcon boxSize={5} />
                </span>
              </span>
            </div>
            {/* <div className="flex flex-col pb-4">
              <span className="pb-3 text-xl text-grayModern-900">
                {t("SettingPanel.Email")}:
              </span>
              <span>{userInfo?.email ? userInfo?.email : t("NoInfo")}</span>
            </div>
            <div className="flex flex-col pb-4">
              <span className=" pb-3 text-xl text-grayModern-900">
                {t("SettingPanel.Registered")}:
              </span>
              <span>{formatDate(userInfo?.createdAt)}</span>
            </div> */}
          </Box>
        </>
      )}
      {showItem === "username" && <UserNameEditor setShowItem={setShowItem} />}
      {showItem === "password" && <PasswordEditor setShowItem={setShowItem} />}
      {showItem === "avatar" && (
        <AvatarEditor
          img={selectedImage}
          setCroppedImageUrl={setCroppedImageUrl}
          setShowItem={setShowItem}
        />
      )}
      {showItem === "phone" && <PhoneEditor setShowItem={setShowItem} />}
      {showItem === "email" && <EmailEditor setShowItem={setShowItem} />}
    </Box>
  );
}
