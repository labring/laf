import { useTranslation } from "react-i18next";
import { Button, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { LanguageIcon } from "@/components/CommonIcon";

const LanguageSwitch = (props: { className?: string; size?: string; color?: string }) => {
  const { i18n, t } = useTranslation();
  const { className, size = "20px", color = "#68686E" } = props;
  const darkMode = useColorMode().colorMode === "dark";

  return (
    <Button
      className={clsx("!rounded !px-2", className)}
      onClick={(event) => {
        event?.preventDefault();
        i18n.changeLanguage(i18n.language === "en" ? "zh" : "en");
      }}
      variant="none"
      leftIcon={<LanguageIcon size={size} color={darkMode ? "white" : color} />}
    >
      <p>{t("i18n tip")}</p>
    </Button>
  );
};

export default LanguageSwitch;
