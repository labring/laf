import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import CreateAppModal from "../CreateAppModal";

import styles from "./index.module.scss";

function Empty() {
  const messageList = [
    "微信小程序/公众号",
    "Android or iOS 应用",
    "个人博客、企业官网",
    "企业信息化建设",
    "个人开发者的「手边云」",
    "等你探索",
  ];
  return (
    <div style={{ height: "75vh", minHeight: "500px" }}>
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-3xl font-bold">你好 👋 ，Violetjam，欢迎来到 LAF 云开发平台！ </h2>
        <p className="mt-10 text-xl w-[460px] mx-auto mb-8">
          在这里，你可以作为全栈、后端、云开发用户、Node.js开发者、独立开发者等，开发出任何应用，例如：
        </p>
        <div className="grid grid-cols-3 w-[722px]">
          {messageList.map((item, index) => {
            return (
              <div className={clsx("flex items-center pl-9 font-medium text-xl", styles.emptyItem)}>
                {item}
              </div>
            );
          })}
        </div>
        <p className="mb-9">快来创建一个属于自己的应用吧～</p>
        <CreateAppModal>
          <Button
            size={"lg"}
            colorScheme="primary"
            style={{ padding: "0 80px" }}
            leftIcon={<AddIcon />}
          >
            {t("NewApplication")}
          </Button>
        </CreateAppModal>
      </div>
    </div>
  );
}

export default Empty;
