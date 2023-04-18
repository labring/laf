import { useTranslation } from "react-i18next";
import { useColorMode } from "@chakra-ui/react";

type Props = {};

const Language = (props: Props) => {
  const { i18n } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

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
        <img
          className="pr-2"
          src={darkMode ? "/homepage/dark/language.svg" : "/homepage/language.svg"}
          alt="language"
        />
        <p>{i18n.language === "en" ? "中文" : "English"}</p>
      </a>
    </div>
  );
};

export default Language;
