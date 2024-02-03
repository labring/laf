import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Divider, Select, Switch, useColorMode } from "@chakra-ui/react";
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
      <div className="mt-8 flex flex-col">
        <span className="mb-2 text-xl font-medium">{t("SettingPanel.Editor")}</span>
        <span className={darkMode ? "mb-2 text-grayModern-200" : "mb-2 text-grayModern-700"}>
          {t("SettingPanel.isOpenLanguageServer")}
        </span>
        <div className="w-48">
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
        </div>
      </div>
      <div className="mt-4 flex flex-col">
        <span className={darkMode ? "mb-2 text-grayModern-200" : "mb-2 text-grayModern-700"}>
          {t("SettingPanel.FontSize")}
        </span>
        <div className="w-48">
          <Select
            className={clsx("!h-8 !border-frostyNightfall-200", darkMode ? "" : "!bg-lafWhite-500")}
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
        </div>
      </div>
      <Divider className="my-8" />
      <div className="flex flex-col">
        <span className="mb-2 text-xl font-medium">{t("SettingPanel.FuncList")}</span>
        <span className={darkMode ? "mb-2 text-grayModern-200" : "mb-2 text-grayModern-700"}>
          {t("SettingPanel.ListDisplay")}
        </span>
        <div className="w-48">
          <Select
            className={clsx("!h-8 !border-frostyNightfall-200", darkMode ? "" : "!bg-lafWhite-500")}
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
        </div>
      </div>
      <Button className="mt-8 !h-9 w-48 !bg-primary-600 hover:!bg-primary-700" onClick={handleSave}>
        {t("Save")}
      </Button>
    </div>
  );
}
