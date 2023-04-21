import { useTranslation } from "react-i18next";
import { useColorMode } from "@chakra-ui/react";

import { LangIcon } from "@/components/CommonIcon";
import { COLOR_MODE } from "@/constants";

type Props = {};

const Language = (props: Props) => {
  const { i18n } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  return (
    <div className="mr-4">
      <a
        className="flex"
        href={"/language"}
        onClick={(event) => {
          event?.preventDefault();
          i18n.changeLanguage(i18n.language === "en" ? "zh" : "en");
        }}
      >
        {/* <img
          className="pr-2"
          src={darkMode ? "/homepage/dark/language.svg" : "/homepage/language.svg"}
          alt="language"
        /> */}
        <LangIcon color={darkMode ? "#F6F8F9" : "#3C455D"} fontSize={32} />
        <p>{i18n.language === "en" ? "中文" : "English"}</p>
      </a>
    </div>
  );
};

export default Language;
