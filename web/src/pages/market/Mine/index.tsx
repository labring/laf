import { useNavigate } from "react-router-dom";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import HeadBar from "../Mods/HeadBar";

import styles from "../Mods/SideBar/index.module.scss";

export default function Mine() {
  const explore_data = ["应用模板", "函数模板"];
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div className={clsx("h-screen w-full", darkMode ? "" : "bg-white")}>
      <HeadBar />
      <div className="absolute bottom-0 top-[60px] flex flex-col justify-between">
        <Box className="pl-16">
          <div className={darkMode ? styles.title_dark : styles.title}>{t("Template.My")}</div>
          {explore_data.map((item) => {
            return (
              <div key={item} className={styles.explore_item}>
                {item}
              </div>
            );
          })}
        </Box>
      </div>
      <Box className="pl-[300px]">
        <Box className="pt-8">
          <Button
            padding={5}
            onClick={() => {
              navigate("/market/mine/new");
            }}
            leftIcon={<AddIcon />}
          >
            {t("Template.CreateTemplate")}
          </Button>
        </Box>
      </Box>
    </div>
  );
}
