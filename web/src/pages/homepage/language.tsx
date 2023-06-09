import { useTranslation } from "react-i18next";
import { useColorMode } from "@chakra-ui/react";

import { LangIcon } from "@/components/CommonIcon";
import { COLOR_MODE } from "@/constants";

const Language = () => {
  const { i18n } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  return (
    <div className="mr-7">
      <a
        className="flex items-center text-lg"
        href={"/language"}
        onClick={(event) => {
          event?.preventDefault();
          i18n.changeLanguage(i18n.language === "en" ? "zh" : "en");
        }}
      >
        <LangIcon className="mr-1" color={darkMode ? "#F6F8F9" : "#3C455D"} fontSize={24} />
        <p>{i18n.language === "en" ? "中文" : "English"}</p>
      </a>
    </div>
  );
};

export default Language;
