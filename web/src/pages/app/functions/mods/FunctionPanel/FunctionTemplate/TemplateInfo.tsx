import { useTranslation } from "react-i18next";
import { Box, Button, VStack } from "@chakra-ui/react";

import { GithubIcon, HeartIcon, PhoneIcon, WechatIcon } from "@/components/CommonIcon";
import FileTypeIcon from "@/components/FileTypeIcon";

export default function TemplateInfo() {
  const { t } = useTranslation();
  return (
    <div>
      <VStack className="h-full w-full">
        <Box className="flex w-full justify-between pb-8">
          <div className="flex cursor-pointer items-center rounded-2xl border-2 px-3 text-xl">
            <HeartIcon />
            <span className="pl-1">112</span>
          </div>
          <Button>{t("Template.useTemplate")}</Button>
        </Box>
        <Box className="w-full">
          <span className="text-xl font-bold">{t("Template.DeveloperInformation")}</span>
          <Box className="flex h-20 items-center justify-between">
            <div className="flex">
              <img src="/logo.png" alt="avatar" className="w-10" />
              <div className="pl-2">
                <span className="text-lg font-semibold">laf-test</span>
                <div>
                  <GithubIcon className="mr-1 cursor-pointer" color={"grayModern.400"} />
                  <WechatIcon className="mr-1 cursor-pointer" color={"grayModern.400"} />
                  <PhoneIcon className="mr-1 cursor-pointer" color={"grayModern.400"} />
                </div>
              </div>
            </div>
            <button className="h-6 w-16 rounded-3xl bg-primary-200 font-semibold text-primary-600">
              {t("Template.Sponsor")}
            </button>
          </Box>
        </Box>
        <Box className="w-full">
          <span className="text-xl font-bold">{t("Template.Function")}</span>
          <Box>
            <div className="flex h-8 items-center font-medium">
              {/* <span className="text-blue-600 pr-2 text-xs">TS</span> */}
              <FileTypeIcon type="ts" />
              <span className="pl-1 text-lg">register</span>
            </div>
            <div className="flex h-8 items-center font-medium">
              <FileTypeIcon type="ts" />
              <span className="pl-1 text-lg">login</span>
            </div>
          </Box>
        </Box>
        <Box className="w-full">
          <span className="text-xl font-bold">{t("Template.Dependency")}</span>
          <Box>
            <div className="flex h-8 items-center justify-between font-medium">
              <div className="flex items-center">
                <FileTypeIcon type="npm" />
                <span className="pl-1">ChatGPT</span>
              </div>
              <span>5.2.1</span>
            </div>
          </Box>
        </Box>
        <Box className="w-full">
          <span className="text-xl font-bold">{t("Template.EnvironmentVariables")}</span>
          <Box>
            <div className="flex h-8 items-center font-medium">OPEN_AI_KEY</div>
          </Box>
        </Box>
      </VStack>
    </div>
  );
}
