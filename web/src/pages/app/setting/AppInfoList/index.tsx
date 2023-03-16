import { useTranslation } from "react-i18next";
import { MdRestartAlt } from "react-icons/md";
import { RiDeleteBin6Line, RiShutDownLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { Box, Button, HStack, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { APP_PHASE_STATUS } from "@/constants/index";

import InfoDetail from "./InfoDetail";

import useGlobalStore from "@/pages/globalStore";
import DeleteAppModal from "@/pages/home/mods/DeleteAppModal";
import StatusBadge from "@/pages/home/mods/StatusBadge";
const AppEnvList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currentApp, updateCurrentApp, regions = [] } = useGlobalStore((state) => state);
  const darkMode = useColorMode().colorMode === "dark";

  if (currentApp?.state === APP_PHASE_STATUS.Deleted) {
    navigate("/");
    return <></>;
  }

  const currentRegion = regions.find((item) => item.id === currentApp?.regionId);

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="flex h-[50px] flex-none justify-between">
          <HStack spacing={2}>
            <Box
              className={clsx("text-xl text-grayModern-900 font-medium", {
                "text-grayModern-100": darkMode,
              })}
            >
              {currentApp?.name}
            </Box>
            <StatusBadge statusConditions={currentApp?.phase} state={currentApp?.state} />
          </HStack>
          <HStack
            spacing={2}
            divider={
              <span className="inline-block mr-2 rounded h-[12px] border border-grayModern-500"></span>
            }
          >
            <Button
              className="mr-2"
              fontWeight={"semibold"}
              size={"sm"}
              isDisabled={currentApp?.state === APP_PHASE_STATUS.Restarting}
              variant={"text"}
              onClick={() => {
                updateCurrentApp(currentApp!);
              }}
            >
              <MdRestartAlt size={16} className="mr-2" />
              {t("SettingPanel.Restart")}
            </Button>
            <Button
              className="mr-2"
              fontWeight={"semibold"}
              size={"sm"}
              variant={"text"}
              onClick={(event: any) => {
                event?.preventDefault();
                updateCurrentApp(currentApp!, APP_PHASE_STATUS.Stopped);
              }}
            >
              <RiShutDownLine size={16} className="mr-2" />
              {t("SettingPanel.Close")}
            </Button>

            <DeleteAppModal
              item={currentApp}
              onSuccess={() => {
                navigate("/");
              }}
            >
              <Button className="mr-2" fontWeight={"semibold"} size={"sm"} variant={"warnText"}>
                <RiDeleteBin6Line size={16} className="mr-2" />
                {t("SettingPanel.Delete")}
              </Button>
            </DeleteAppModal>
          </HStack>
        </div>
        <div className="flex-grow flex overflow-auto flex-col">
          <InfoDetail
            title={t("SettingPanel.BaseInfo")}
            leftData={[
              { key: "APPID", value: currentApp?.appid },
              { key: t("HomePanel.Region"), value: currentRegion?.displayName },
            ]}
            rightData={[
              { key: t("HomePanel.BundleName"), value: currentApp?.bundle.name },
              { key: t("HomePanel.RuntimeName"), value: currentApp?.runtime.name },
            ]}
          />
          <InfoDetail
            className="mt-6"
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
              {
                key: t("Spec.Database"),
                value: `${currentApp?.bundle?.resource.databaseCapacity! / 1024} ${t("Unit.GB")}`,
              },
            ]}
            rightData={[
              {
                key: t("Spec.Storage"),
                value: `${currentApp?.bundle?.resource.storageCapacity! / 1024} ${t("Unit.GB")}`,
              },
              {
                key: t("Spec.NetworkTraffic"),
                value: `${currentApp?.bundle?.resource.networkTrafficOutbound! / 1024} ${t(
                  "Unit.GB",
                )}`,
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};

export default AppEnvList;
