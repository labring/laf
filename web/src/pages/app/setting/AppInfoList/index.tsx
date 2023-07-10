import { useTranslation } from "react-i18next";
import { MdPlayCircleOutline, MdRestartAlt } from "react-icons/md";
import { RiDeleteBin6Line, RiShutDownLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { Box, Button, HStack, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { APP_PHASE_STATUS, APP_STATUS, COLOR_MODE, Routes } from "@/constants/index";

import InfoDetail from "./InfoDetail";

import useGlobalStore from "@/pages/globalStore";
import DeleteAppModal from "@/pages/home/mods/DeleteAppModal";
import StatusBadge from "@/pages/home/mods/StatusBadge";
const AppEnvList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currentApp, updateCurrentApp, regions = [] } = useGlobalStore((state) => state);
  const darkMode = useColorMode().colorMode === COLOR_MODE.dark;

  if (currentApp?.state === APP_PHASE_STATUS.Deleted) {
    navigate(Routes.dashboard);
    return <></>;
  }

  const currentRegion = regions.find((item) => item._id === currentApp?.regionId);

  return (
    <>
      <div className="flex flex-col pt-12">
        <div className="flex flex-none justify-between">
          <HStack spacing={2}>
            <Box
              className={clsx("text-xl font-medium", {
                "text-grayModern-100": darkMode,
              })}
            >
              {currentApp?.name}
            </Box>
            <StatusBadge
              className="rounded-full bg-primary-100"
              statusConditions={currentApp?.phase}
              state={currentApp?.state}
            />
          </HStack>
          <HStack
            spacing={2}
            divider={
              <span className="mr-2 inline-block h-[12px] rounded border border-grayModern-500"></span>
            }
          >
            <Button
              className="mr-2"
              fontWeight={"semibold"}
              size={"sm"}
              isDisabled={
                currentApp?.phase !== APP_PHASE_STATUS.Stopped &&
                currentApp?.phase !== APP_PHASE_STATUS.Started
              }
              variant={"text"}
              onClick={() => {
                updateCurrentApp(
                  currentApp!,
                  currentApp?.state === APP_STATUS.Stopped
                    ? APP_STATUS.Running
                    : APP_STATUS.Restarting,
                );
              }}
            >
              {currentApp?.phase === APP_PHASE_STATUS.Stopped ? (
                <>
                  <MdPlayCircleOutline size={16} className="mr-1" />
                  {t("SettingPanel.Start")}
                </>
              ) : (
                <>
                  <MdRestartAlt size={16} className="mr-1" />
                  {t("SettingPanel.Restart")}
                </>
              )}
            </Button>
            {currentApp?.phase === APP_PHASE_STATUS.Started ? (
              <Button
                className="mr-2"
                fontWeight={"semibold"}
                size={"sm"}
                variant={"text"}
                onClick={(event: any) => {
                  event?.preventDefault();
                  updateCurrentApp(currentApp!, APP_STATUS.Stopped);
                }}
              >
                <RiShutDownLine size={16} className="mr-1" />
                {t("SettingPanel.Pause")}
              </Button>
            ) : null}

            <DeleteAppModal
              item={currentApp}
              onSuccess={() => {
                navigate(Routes.dashboard);
              }}
            >
              <Button className="mr-2" fontWeight={"semibold"} size={"sm"} variant={"warnText"}>
                <RiDeleteBin6Line size={16} className="mr-1" />
                {t("SettingPanel.Delete")}
              </Button>
            </DeleteAppModal>
          </HStack>
        </div>
        <div className="mt-4 flex flex-grow flex-col overflow-auto">
          <InfoDetail
            title={t("SettingPanel.BaseInfo")}
            leftData={[
              { key: "APPID", value: currentApp?.appid },
              { key: t("HomePanel.Region"), value: currentRegion?.displayName },
            ]}
            rightData={[{ key: t("HomePanel.RuntimeName"), value: currentApp?.runtime.name }]}
          />
          <InfoDetail
            title={t("SettingPanel.Detail")}
            leftData={[
              {
                key: "CPU",
                value: `${currentApp?.bundle?.resource?.limitCPU! / 1000} ${t("Unit.CPU")}`,
              },
              {
                key: t("Spec.RAM"),
                value: `${currentApp?.bundle?.resource.limitMemory} ${t("Unit.MB")}`,
              },
            ]}
            rightData={[
              {
                key: t("Spec.Database"),
                value: `${currentApp?.bundle?.resource.databaseCapacity! / 1024} ${t("Unit.GB")}`,
              },
              {
                key: t("Spec.Storage"),
                value: `${currentApp?.bundle?.resource.storageCapacity! / 1024} ${t("Unit.GB")}`,
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default AppEnvList;
