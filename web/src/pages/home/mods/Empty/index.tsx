import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import CreateAppModal from "../CreateAppModal";

import styles from "./index.module.scss";

import useGlobalStore from "@/pages/globalStore";

function Empty() {
  const messageList = [
    t("HomePanel.WX"),
    t("HomePanel.APP"),
    t("HomePanel.Blog"),
    t("HomePanel.Enterprise"),
    t("HomePanel.Personal"),
    t("HomePanel.Explore"),
  ];

  const { userInfo } = useGlobalStore();

  return (
    <div style={{ height: "75vh", minHeight: "500px" }}>
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-3xl font-bold">
          {t("HomePanel.Hello")} 👋 ， {userInfo?.profile.name} ， {t("HomePanel.Welcome")}
        </h2>
        <p className="mt-10 text-xl w-[460px] mx-auto mb-8">{t("HomePanel.Introduction")}</p>
        <div className="grid grid-cols-3 w-[722px]">
          {messageList.map((item, index) => {
            return (
              <div
                key={index}
                className={clsx("flex items-center pl-9 font-medium text-xl", styles.emptyItem)}
              >
                {item}
              </div>
            );
          })}
        </div>
        <p className="mb-9">{t("HomePanel.Use")}</p>
        <CreateAppModal>
          <Button
            size={"lg"}
            colorScheme="primary"
            style={{ padding: "0 80px" }}
            leftIcon={<AddIcon />}
          >
            {t("Create") + t("HomePanel.Application")}
          </Button>
        </CreateAppModal>
      </div>
    </div>
  );
}

export default Empty;
