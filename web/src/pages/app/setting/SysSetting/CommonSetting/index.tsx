import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, HStack, Select, Switch, useColorMode, VStack } from "@chakra-ui/react";
import clsx from "clsx";

import useCustomSettingStore from "@/pages/customSetting";
import useGlobalStore from "@/pages/globalStore";

const fontSizes = [12, 13, 14, 15, 16, 17, 18, 19, 20];

export default function CommonSetting() {
  const { setCommonSettings, commonSettings } = useCustomSettingStore();
  const [currentCommonSettings, setCurrentCommonSettings] = useState(commonSettings);
  const { showSuccess } = useGlobalStore((state) => state);
  const handleSave = () => {
    setCommonSettings(currentCommonSettings);
    showSuccess(t("SavedSuccessfully"));
  };
  const { t } = useTranslation();
  const darkMode = useColorMode().colorMode === "dark";

  return (
    <div className="ml-12 mr-16">
      <div className="mt-8">
        <header className="text-xl font-medium">{t("SettingPanel.Editor")}</header>
        <VStack spacing={3} pt={3}>
          <HStack justifyContent="space-between" w="full">
            <span
              className={clsx(
                "text-[13px]",
                darkMode ? "text-grayModern-200" : "text-grayModern-700",
              )}
            >
              {t("SettingPanel.isOpenLanguageServer")}
            </span>
            <Switch
              defaultChecked={currentCommonSettings.useLSP}
              onChange={() => {
                setCurrentCommonSettings({
                  ...currentCommonSettings,
                  useLSP: !currentCommonSettings.useLSP,
                });
              }}
              variant={"primary"}
              colorScheme="primary"
            />
          </HStack>
          <HStack justifyContent="space-between" w="full">
            <span
              className={clsx(
                "text-[13px]",
                darkMode ? "text-grayModern-200" : "text-grayModern-700",
              )}
            >
              {t("SettingPanel.AICompletion")}
            </span>
            <Switch
              defaultChecked={currentCommonSettings.useCopilot}
              onChange={() => {
                setCurrentCommonSettings({
                  ...currentCommonSettings,
                  useCopilot: !currentCommonSettings.useCopilot,
                });
              }}
              variant={"primary"}
              colorScheme="primary"
            />
          </HStack>
          <HStack justifyContent="space-between" w="full">
            <span
              className={clsx(
                "text-[13px]",
                darkMode ? "text-grayModern-200" : "text-grayModern-700",
              )}
            >
              {t("SettingPanel.FontSize")}
            </span>
            <Select
              w="24"
              className={clsx(
                "!h-7 !border-frostyNightfall-200",
                darkMode ? "" : "!bg-lafWhite-500",
              )}
              value={currentCommonSettings.fontSize}
              onChange={(e) =>
                setCurrentCommonSettings({
                  ...currentCommonSettings,
                  fontSize: Number(e.target.value),
                })
              }
            >
              {fontSizes.map((size) => {
                return (
                  <option key={size} value={size}>
                    {size}
                  </option>
                );
              })}
            </Select>
          </HStack>
        </VStack>
      </div>
      <Divider className="my-8" />
      <div>
        <header className="text-xl font-medium">{t("SettingPanel.FuncList")}</header>
        <VStack spacing={3} pt={3}>
          <HStack justifyContent="space-between" w="full">
            <span
              className={clsx(
                "text-[13px]",
                darkMode ? "text-grayModern-200" : "text-grayModern-700",
              )}
            >
              {t("SettingPanel.ListDisplay")}
            </span>
            <Select
              w="24"
              className={clsx(
                "!h-7 !border-frostyNightfall-200",
                darkMode ? "" : "!bg-lafWhite-500",
              )}
              value={currentCommonSettings.funcListDisplay}
              onChange={(e) =>
                setCurrentCommonSettings({
                  ...currentCommonSettings,
                  funcListDisplay: e.target.value,
                })
              }
            >
              <option value="name">{t("SettingModal.FunctionName")}</option>
              <option value="desc">{t("SettingModal.FunctionDesc")}</option>
              <option value="desc-name">{t("SettingModal.FunctionDesc_Name")}</option>
              <option value="name-desc">{t("SettingModal.FunctionName_Desc")}</option>
            </Select>
          </HStack>
        </VStack>
      </div>
      <Button
        className="mt-12 !h-9 w-48 !bg-primary-600 hover:!bg-primary-700"
        onClick={handleSave}
      >
        {t("Save")}
      </Button>
    </div>
  );
}
