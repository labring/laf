import { useTranslation } from "react-i18next";
import { MdPlayCircleOutline, MdRestartAlt } from "react-icons/md";
import { RiDeleteBin6Line, RiShutDownLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { Box, Button, HStack, useColorMode, VStack } from "@chakra-ui/react";
import clsx from "clsx";

import { APP_PHASE_STATUS, APP_STATUS, COLOR_MODE, Routes } from "@/constants/index";
import { formatDate, formatSize } from "@/utils/format";

import InfoDetail from "./InfoDetail";

import useGlobalStore from "@/pages/globalStore";
import DeleteAppModal from "@/pages/home/mods/DeleteAppModal";
import StatusBadge from "@/pages/home/mods/StatusBadge";

interface AppEnvListProps {
  onClose?: () => void;
}

const AppEnvList: React.FC<AppEnvListProps> = (props = {}) => {
  const { onClose } = props;
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
      <div className="flex flex-col pt-10">
        <VStack spacing={0}>
          <StatusBadge
            className="mb-3 px-3"
            statusConditions={currentApp?.phase}
            state={currentApp?.state}
          />
          <Box
            className={clsx("!mb-4 text-[20px] font-medium", {
              "text-grayModern-100": darkMode,
            })}
          >
            {currentApp?.name}
          </Box>
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
              color={"grayModern.600"}
              bg={"none"}
              _hover={{ color: "primary.600" }}
              onClick={() => {
                updateCurrentApp(
                  currentApp!,
                  currentApp?.state === APP_STATUS.Stopped
                    ? APP_STATUS.Running
                    : APP_STATUS.Restarting,
                );
                //  when start close modal window
                if (currentApp?.phase === APP_PHASE_STATUS.Stopped && onClose) {
                  onClose();
                }
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
                color={"grayModern.600"}
                bg={"none"}
                _hover={{ color: "primary.600" }}
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
              <Button
                className="mr-2"
                fontWeight={"semibold"}
                size={"sm"}
                color={"grayModern.600"}
                bg={"none"}
                _hover={{ color: "error.500" }}
              >
                <RiDeleteBin6Line size={16} className="mr-1" />
                {t("SettingPanel.Delete")}
              </Button>
            </DeleteAppModal>
          </HStack>
        </VStack>
        <div className="mt-8 flex flex-grow justify-center space-x-5 overflow-auto">
          <InfoDetail
            title={t("SettingPanel.BaseInfo")}
            data={[
              { key: "APP ID", value: currentApp?.appid },
              { key: t("HomePanel.Region"), value: currentRegion?.displayName },
              { key: t("HomePanel.RuntimeName"), value: currentApp?.runtime.name },
              { key: t("CreateTime"), value: formatDate(currentApp.createdAt) },
            ]}
            className={darkMode ? "w-60" : "w-60 bg-[#F8FAFB]"}
          />
          <InfoDetail
            title={t("SettingPanel.Detail")}
            data={[
              {
                key: "CPU",
                value: `${currentApp?.bundle?.resource?.limitCPU! / 1000} ${t("Unit.CPU")}`,
              },
              {
                key: t("Spec.RAM"),
                value: String(
                  formatSize(currentApp?.bundle?.resource.limitMemory * 1024 * 1024, 0),
                ),
              },
              {
                key: t("Spec.Database"),
                value: String(
                  formatSize(currentApp?.bundle?.resource.databaseCapacity * 1024 * 1024, 0),
                ),
              },
              {
                key: t("Spec.Storage"),
                value: String(
                  formatSize(currentApp?.bundle?.resource.storageCapacity * 1024 * 1024, 0),
                ),
              },
            ]}
            className={darkMode ? "w-60" : "w-60 bg-[#F8FAFB]"}
          />
        </div>
      </div>
    </>
  );
};

export default AppEnvList;
