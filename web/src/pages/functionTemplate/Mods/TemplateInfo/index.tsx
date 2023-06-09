import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Box, Button, useColorMode, VStack } from "@chakra-ui/react";
import clsx from "clsx";

import { GithubIcon, PhoneIcon, WechatIcon } from "@/components/CommonIcon";
import { HeartIcon } from "@/components/CommonIcon";
import FileTypeIcon from "@/components/FileTypeIcon";

import UseTemplateModal from "../UseTemplateModal";

import SponsorModal from "./SponsorModal";

const TemplateInfo = (props: {
  author: string;
  functionList: { name: string; code: string }[];
  packageList: { name: string; version: string }[];
  isFromMarket?: boolean;
}) => {
  const { author, functionList, packageList, isFromMarket } = props;
  const { t } = useTranslation();
  const [likes, setLikes] = useState(112);
  const [liked, setLiked] = useState(false);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div className="w-full">
      <Box className="flex w-full justify-between pb-8">
        <button
          className={clsx(
            "flex cursor-pointer items-center rounded-3xl border-2 px-3 py-1 text-xl ",
            liked ? "" : "text-gray-400",
          )}
          onClick={() => {
            if (liked) {
              setLikes(likes - 1);
              setLiked(false);
            } else {
              setLikes(likes + 1);
              setLiked(true);
            }
          }}
        >
          <HeartIcon />
          <span className="pl-1">{likes}</span>
        </button>
        {isFromMarket ? (
          <UseTemplateModal>
            <Button>{t("Template.useTemplate")}</Button>
          </UseTemplateModal>
        ) : (
          <Button>{t("Template.useTemplate")}</Button>
        )}
      </Box>

      <VStack>
        <Box className="w-full border-b-2">
          <span className="text-xl font-bold">{t("Template.DeveloperInformation")}</span>
          <Box className="flex h-20 items-center justify-between">
            <div className="flex">
              <img src="/logo.png" alt="avatar" className="w-10" />
              <div className="pl-2">
                <span className="text-lg font-semibold">{author}</span>
                <div>
                  <GithubIcon className="mr-1 cursor-pointer" color={"grayModern.400"} />
                  <WechatIcon className="mr-1 cursor-pointer" color={"grayModern.400"} />
                  <PhoneIcon className="mr-1 cursor-pointer" color={"grayModern.400"} />
                </div>
              </div>
            </div>
            <SponsorModal>
              <button className="h-6 w-16 rounded-3xl bg-primary-200 font-semibold text-primary-600 hover:bg-primary-300">
                {t("Template.Sponsor")}
              </button>
            </SponsorModal>
          </Box>
        </Box>
        <Box className="w-full border-b-2 pb-2">
          <span className="text-xl font-bold">{t("Template.Function")}</span>
          <Box>
            {functionList.map((item) => {
              return (
                <div key={item.name} className="flex h-8 items-center font-medium">
                  <FileTypeIcon type="ts" />
                  <span className="pl-1 text-lg">{item.name}</span>
                </div>
              );
            })}
          </Box>
        </Box>
        <Box className="w-full border-b-2 pb-2">
          <span className="text-xl font-bold">{t("Template.Dependency")}</span>
          <Box>
            {packageList.map((item) => {
              return (
                <div key={item.name} className="flex h-8 items-center justify-between font-medium">
                  <div className="flex items-center">
                    <FileTypeIcon type="npm" />
                    <span className="pl-1">{item.name}</span>
                  </div>
                  <span>{item.version}</span>
                </div>
              );
            })}
          </Box>
        </Box>
        <Box className="w-full border-b-2 pb-2">
          <span className="text-xl font-bold">{t("Template.EnvironmentVariables")}</span>
          <Box>
            <div className="flex items-center py-1 font-medium">OPEN_AI_KEY</div>
          </Box>
        </Box>
        <Box className="w-full">
          <div className="flex items-center">
            <span className="text-xl font-bold">{t("Template.UsedBy")}</span>
            <span
              className={clsx(
                "ml-2 rounded-xl px-2 text-lg",
                darkMode ? "bg-gray-700" : "bg-gray-100",
              )}
            >
              2
            </span>
          </div>
          <div className="mt-1 flex">
            <Box className="pr-2">
              <Avatar size="sm" name="Dan" src="https://bit.ly/dan-abramov" />
            </Box>
            <Box>
              <Avatar size="sm" name="Kola" src="https://bit.ly/tioluwani-kolawole" />
            </Box>
          </div>
        </Box>
      </VStack>
    </div>
  );
};

export default TemplateInfo;
