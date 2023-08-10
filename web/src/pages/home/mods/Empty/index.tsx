import { useTranslation } from "react-i18next";
import { AddIcon } from "@chakra-ui/icons";
import { Button, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { COLOR_MODE } from "@/constants";
import { hidePhoneNumber } from "@/utils/format";

import CreateAppModal from "../CreateAppModal";

import styles from "./index.module.scss";

import useGlobalStore from "@/pages/globalStore";

function Empty() {
  const { t } = useTranslation();
  const messageList = [
    t("HomePanel.WX"),
    t("HomePanel.APP"),
    t("HomePanel.Blog"),
    t("HomePanel.Enterprise"),
    t("HomePanel.Personal"),
    t("HomePanel.Explore"),
  ];

  const { userInfo } = useGlobalStore();

  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  return (
    <div style={{ height: "75vh", minHeight: "500px" }}>
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="flex text-3xl font-bold">
          {t("HomePanel.Hello")} 👋 ， {hidePhoneNumber(userInfo?.username || "")} ，
          {t("HomePanel.WelcomeTo")}
          <span className="ml-2 text-primary-600">{t("HomePanel.LAF")}</span>
        </h2>
        <p className="my-8 w-[460px] text-center text-xl">{t("HomePanel.Introduction")}</p>
        <div className="grid w-[722px] grid-cols-3">
          {messageList.map((item, index) => {
            return (
              <div
                key={index}
                className={clsx("flex items-center pl-9 text-xl font-medium", styles.emptyItem, {
                  "bg-lafDark-300": darkMode,
                  "bg-lafWhite-100": !darkMode,
                })}
              >
                {item}
              </div>
            );
          })}
        </div>
        <p className="mb-9 text-lg">{t("HomePanel.Use")}</p>
        <CreateAppModal type={"create"}>
          <Button
            size={"lg"}
            colorScheme="primary"
            style={{ padding: "0 80px" }}
            leftIcon={<AddIcon />}
          >
            {t("CreateApp")}
          </Button>
        </CreateAppModal>
      </div>
    </div>
  );
}

export default Empty;
