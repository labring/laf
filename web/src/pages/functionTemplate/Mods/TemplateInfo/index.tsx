import { useTranslation } from "react-i18next";
import { Avatar, AvatarGroup, Box, Tooltip, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import FileTypeIcon from "@/components/FileTypeIcon";
import { getAvatarUrl } from "@/utils/getAvatarUrl";

import UseTemplate from "./UseTemplate";

import { TFunctionTemplate } from "@/apis/typing";

const TemplateInfo = (props: { functionTemplate: TFunctionTemplate; usedBy: any[] }) => {
  const { functionTemplate, usedBy } = props;
  const { items: functionList, environments, dependencies: packageList } = functionTemplate;

  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div>
      <UseTemplate template={functionTemplate} />
      <div>
        <Box className="border-b-[1px]">
          <span className="text-xl font-semibold">{t("Template.Function")}</span>
          <Box className="max-h-40 overflow-auto py-2">
            {(functionList || []).map((item) => {
              return (
                <div key={item.name} className="my-5 flex items-center font-medium">
                  <FileTypeIcon type="ts" fontSize={18} />
                  <span className="pl-1 text-lg">{item.name}</span>
                </div>
              );
            })}
          </Box>
        </Box>
        <Box className={clsx("border-b-[1px] pt-5", packageList.length === 0 && "pb-2")}>
          <span className="text-xl font-semibold">{t("Template.Dependency")}</span>
          <Box className="max-h-32 overflow-auto">
            {packageList.map((item) => {
              const [name, version] = item.split("@");
              return (
                <div key={item} className="my-5 flex items-center justify-between font-medium">
                  <div className="flex items-center">
                    <FileTypeIcon type="npm" />
                    <span className="pl-1">{name}</span>
                  </div>
                  <span>{version}</span>
                </div>
              );
            })}
          </Box>
        </Box>
        <Box className={clsx("border-b-[1px] pt-5", environments.length === 0 && "pb-2")}>
          <span className="text-xl font-bold">{t("Template.EnvironmentVariables")}</span>
          <Box className="max-h-32 overflow-hidden">
            {environments.map((item) => {
              return (
                <Box key={item.name} className="my-5 flex justify-between">
                  <div className="flex w-5/12 truncate font-medium">{item.name}</div>
                  <Tooltip label={item.value} aria-label="A tooltip">
                    <div className="truncate pl-4">{item.value}</div>
                  </Tooltip>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box className={clsx("border-b-[1px]", usedBy.length === 0 && "pb-2")}>
          <div className="flex items-center pt-5">
            <span className="text-xl font-bold">{t("Template.UsedBy")}</span>
            <span
              className={clsx(
                "ml-2 rounded-xl px-2 text-lg",
                darkMode ? "bg-gray-700" : "bg-gray-100",
              )}
            >
              {usedBy.length}
            </span>
          </div>
          <AvatarGroup size={"sm"} max={10}>
            {usedBy.map((item) => {
              return (
                <Box className="my-5 mr-2" key={item.uid}>
                  <Avatar size="sm" name={item.uid} src={getAvatarUrl(item.uid)} />
                </Box>
              );
            })}
          </AvatarGroup>
        </Box>
      </div>
    </div>
  );
};

export default TemplateInfo;
