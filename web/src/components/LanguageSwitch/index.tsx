import { useTranslation } from "react-i18next";
import { Button } from "@chakra-ui/react";
import clsx from "clsx";

import { LangIcon } from "@/components/CommonIcon";

const LanguageSwitch = (props: { className?: string }) => {
  const { i18n, t } = useTranslation();
  const { className } = props;

  return (
    <Button
      className={clsx("!px-0 !font-normal", className)}
      onClick={(event) => {
        event?.preventDefault();
        i18n.changeLanguage(i18n.language === "en" ? "zh" : "en");
      }}
      variant="none"
    >
      <LangIcon className={clsx("mr-1", className)} />
      <p>{t("i18n tip")}</p>
    </Button>
  );
};

export default LanguageSwitch;
