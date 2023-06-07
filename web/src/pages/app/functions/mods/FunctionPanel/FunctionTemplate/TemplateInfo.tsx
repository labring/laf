import { useTranslation } from "react-i18next";
import { Box, VStack } from "@chakra-ui/react";

import { GithubIcon, PhoneIcon, WechatIcon } from "@/components/CommonIcon";
import FileTypeIcon from "@/components/FileTypeIcon";

const TemplateInfo = (props: {
  author: string;
  functionList: { name: string; code: string }[];
  packageList: { name: string; version: string }[];
}) => {
  const { author, functionList, packageList } = props;
  const { t } = useTranslation();

  return (
    <div>
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
            <button className="h-6 w-16 rounded-3xl bg-primary-200 font-semibold text-primary-600">
              {t("Template.Sponsor")}
            </button>
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
        {/* <Box className="w-full">
          <span className="text-xl font-bold">{t("Template.EnvironmentVariables")}</span>
          <Box>
            <div className="flex h-8 items-center font-medium">OPEN_AI_KEY</div>
          </Box>
        </Box> */}
      </VStack>
    </div>
  );
};

export default TemplateInfo;
