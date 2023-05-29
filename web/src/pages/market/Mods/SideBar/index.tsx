import { useTranslation } from "react-i18next";
import { Box, useColorMode } from "@chakra-ui/react";

import styles from "./index.module.scss";

export default function SideBar() {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const explore_data = [t("market.appTemplate"), t("market.funcTemplate")];
  const category_data = [t("market.all"), "热门", "最新", "Saas", "小游戏"];

  return (
    <div className="absolute bottom-0 top-[60px] flex flex-col justify-between">
      <Box className="pl-16">
        <div className={darkMode ? styles.title_dark : styles.title}>{t("market.explore")}</div>
        {explore_data.map((item) => {
          return (
            <div key={item} className={styles.explore_item}>
              {item}
            </div>
          );
        })}
        <div className={darkMode ? styles.title_dark : styles.title}>{t("market.category")}</div>
        {category_data.map((item) => {
          return (
            <div key={item} className={styles.category_item}>
              {item}
            </div>
          );
        })}
      </Box>
    </div>
  );
}
