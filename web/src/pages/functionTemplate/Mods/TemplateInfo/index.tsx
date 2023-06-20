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
    <div className="w-full">
      <Box className="flex w-full justify-between pb-8">
        <button
          className={clsx(
            "mr-2 flex cursor-pointer items-center rounded-3xl border-2 px-3 py-1 text-xl",
            starState && !darkMode ? "border-gray-800 text-gray-800" : "text-gray-400",
            starState && darkMode ? "border-white text-white" : "text-gray-400",
          )}
          onClick={async () => {
            const res = await starMutation.mutateAsync({ templateId: templateId || "" });
            if (!res.error) {
              console.log(res.data);
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
          <Button>{t("Template.useTemplate")}</Button>
        </UseTemplateModal>
      </Box>

      <div>
        {/* <Box className="w-full border-b-2">
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
        </Box> */}
        <Box className="w-full border-b-[1px]">
          <span className="text-xl font-semibold">{t("Template.Function")}</span>
          <Box className="py-3">
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
        <Box className="w-full border-b-[1px] pt-5">
          <span className="text-xl font-semibold">{t("Template.Dependency")}</span>
          <Box>
            {(packageList || []).map((item) => {
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
        <Box className="w-full border-b-[1px] pt-5">
          <span className="text-xl font-bold">{t("Template.EnvironmentVariables")}</span>
          {(environments || []).map((item) => {
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
        <Box className="w-full border-b-[1px]">
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
          <div className="flex">
            {usedBy.map((item) => {
              return (
                <Tooltip
                  key={item.users[0].username}
                  label={item.users[0].username}
                  aria-label="A tooltip"
                >
                  <Box className="my-5 mr-2">
                    <Avatar size="sm" name={item.users[0].username} />
                  </Box>
                </Tooltip>
              );
            })}
          </div>
        </Box>
      </div>
    </div>
  );
};

export default TemplateInfo;
