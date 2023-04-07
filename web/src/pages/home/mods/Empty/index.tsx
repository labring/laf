import { useTranslation } from "react-i18next";
import { AddIcon } from "@chakra-ui/icons";
import { Button, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

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
  const darkMode = colorMode === "dark";

  return (
    <div style={{ height: "75vh", minHeight: "500px" }}>
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-3xl font-bold">
          {t("HomePanel.Hello")} 👋 ， {userInfo?.profile?.name || userInfo?.username} ，{" "}
          {t("HomePanel.Welcome")}
        </h2>
        <p className="mx-auto mb-8 mt-10 w-[460px] text-xl">{t("HomePanel.Introduction")}</p>
        <div className="grid w-[722px] grid-cols-3">
          {messageList.map((item, index) => {
            return (
              <div
                key={index}
                className={clsx("flex items-center pl-9 text-xl font-medium", styles.emptyItem, {
                  "bg-lafDark-300": darkMode,
                })}
              >
                {item}
              </div>
            );
          })}
        </div>
        <p className="mb-9">{t("HomePanel.Use")}</p>
        <CreateAppModal type={"create"}>
          <Button
            size={"lg"}
            colorScheme="primary"
            style={{ padding: "0 80px" }}
            leftIcon={<AddIcon />}
          >
            {t("Create")}
          </Button>
        </CreateAppModal>
      </div>
    </div>
  );
}

export default Empty;
