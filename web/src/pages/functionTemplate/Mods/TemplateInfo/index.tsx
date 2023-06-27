import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Box, Button, Tooltip, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { FilledHeartIcon, HeartIcon } from "@/components/CommonIcon";
import FileTypeIcon from "@/components/FileTypeIcon";

import { useFunctionTemplateStarMutation, useGetStarStateQuery } from "../../service";
import UseTemplateModal from "../UseTemplateModal";

import { TFunctionTemplate } from "@/apis/typing";

const TemplateInfo = (props: { functionTemplate: TFunctionTemplate; usedBy: any[] }) => {
  const { functionTemplate, usedBy } = props;
  const {
    items: functionList,
    environments,
    dependencies: packageList,
    star,
    _id: templateId,
  } = functionTemplate;

  const { t } = useTranslation();
  const [starState, setStarState] = useState(false);
  const [starNum, setStarNum] = useState(star);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  const starMutation = useFunctionTemplateStarMutation();

  useGetStarStateQuery(
    { id: templateId },
    {
      onSuccess: (data: any) => {
        setStarState(data.data === "stared");
      },
    },
  );

  return (
    <div>
      <Box className="flex justify-end pb-8">
        <button
          className={clsx(
            "mr-4 flex h-9 cursor-pointer items-center rounded-3xl border px-3 text-xl",
            starState ? "border-rose-500 text-rose-500" : "text-gray-400",
          )}
          onClick={async () => {
            const res = await starMutation.mutateAsync({ templateId: templateId || "" });
            if (!res.error) {
              if (starState) {
                setStarState(false);
                setStarNum(starNum - 1);
              } else if (starNum >= 0) {
                setStarState(true);
                setStarNum(starNum + 1);
              }
            }
          }}
        >
          {starState ? <FilledHeartIcon /> : <HeartIcon />}
          <span className="pl-1">{starNum}</span>
        </button>
        <UseTemplateModal templateId={templateId || ""}>
          <Button height={9}>{t("Template.useTemplate")}</Button>
        </UseTemplateModal>
      </Box>

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
          <div className="flex w-full overflow-auto">
            {usedBy.map((item) => {
              return (
                <Box className="my-5 mr-2" key={item.users[0].username}>
                  <Avatar size="sm" name={item.users[0].username} />
                </Box>
              );
            })}
          </div>
        </Box>
      </div>
    </div>
  );
};

export default TemplateInfo;
