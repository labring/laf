import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Box, Button, Tooltip, useColorMode, VStack } from "@chakra-ui/react";
import clsx from "clsx";

import { FilledHeartIcon, HeartIcon } from "@/components/CommonIcon";
import FileTypeIcon from "@/components/FileTypeIcon";

import {
  useFunctionTemplateStarMutation,
  useFunctionTemplateUseMutation,
  useGetStarStateQuery,
} from "../../service";
import UseTemplateModal from "../UseTemplateModal";

import { TFunctionTemplate } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

const TemplateInfo = (props: {
  isFromMarket?: boolean;
  functionTemplate: TFunctionTemplate;
  usedBy: any[];
}) => {
  const { functionTemplate, isFromMarket, usedBy } = props;
  const {
    items: functionList,
    environments,
    dependencies: packageList,
    star,
    _id: templateId,
  } = functionTemplate;
  const { currentApp, showError, showSuccess } = useGlobalStore();

  const { t } = useTranslation();
  const [starState, setStarState] = useState(false);
  const [starNum, setStarNum] = useState(star);
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  const starMutation = useFunctionTemplateStarMutation();
  const useTemplateMutation = useFunctionTemplateUseMutation();

  useGetStarStateQuery(
    { id: templateId || "" },
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
            starState ? "border-gray-800" : "text-gray-400",
            starState && darkMode ? "border-gray-100" : "",
          )}
          onClick={async () => {
            const res = await starMutation.mutateAsync({ functionTemplateId: templateId || "" });
            if (!res.error) {
              console.log(res.data);
              if (starState) {
                setStarState(false);
                setStarNum(starNum - 1);
                showError(t("Template.cancelStarSuccess"));
              } else if (starNum >= 0) {
                setStarState(true);
                setStarNum(starNum + 1);
                showSuccess(t("Template.starSuccess"));
              }
            }
          }}
        >
          {starState ? <FilledHeartIcon /> : <HeartIcon />}
          <span className="pl-1">{starNum}</span>
        </button>
        {isFromMarket ? (
          <UseTemplateModal templateId={templateId || ""}>
            <Button>{t("Template.useTemplate")}</Button>
          </UseTemplateModal>
        ) : (
          <Button
            onClick={async () => {
              const res = await useTemplateMutation.mutateAsync({
                appid: currentApp.appid || "",
                functionTemplateId: templateId,
              });
              if (!res.error) {
                showSuccess(t("Template.UsedSuccessfully"));
                window.location.reload();
              }
            }}
          >
            {t("Template.useTemplate")}
          </Button>
        )}
      </Box>

      <VStack>
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
        <Box className="w-full border-b-2 pb-2">
          <span className="text-xl font-bold">{t("Template.Function")}</span>
          <Box>
            {(functionList || []).map((item) => {
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
            {(packageList || []).map((item) => {
              const [name, version] = item.split("@");
              return (
                <div key={item} className="flex h-8 items-center justify-between font-medium">
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
        <Box className="w-full border-b-2 pb-2">
          <span className="text-xl font-bold">{t("Template.EnvironmentVariables")}</span>
          {(environments || []).map((item) => {
            return (
              <Box key={item.name}>
                <div className="flex items-center py-1 font-medium">{item.name}</div>
              </Box>
            );
          })}
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
              {usedBy.length}
            </span>
          </div>
          <div className="mt-1 flex">
            {usedBy.map((item) => {
              return (
                <Tooltip
                  key={item.users[0].username}
                  label={item.users[0].username}
                  aria-label="A tooltip"
                >
                  <Box className="mr-1">
                    <Avatar size="sm" name={item.users[0].username} />
                  </Box>
                </Tooltip>
              );
            })}
          </div>
        </Box>
      </VStack>
    </div>
  );
};

export default TemplateInfo;
