import { useTranslation } from "react-i18next";
import { Box, useColorMode } from "@chakra-ui/react";

import styles from "./index.module.scss";

export default function SideBar() {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const category_data = [t("market.all"), "热门", "最新"];

  return (
    <div className="absolute bottom-0 top-[60px] flex flex-col justify-between">
      <Box className="pl-16">
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
