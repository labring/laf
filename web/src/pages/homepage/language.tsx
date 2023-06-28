import { useTranslation } from "react-i18next";

import { LangIcon } from "@/components/CommonIcon";

const Language = (props: { fontSize: number }) => {
  const { fontSize } = props;
  const { i18n } = useTranslation();

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
        <LangIcon className="mr-1" fontSize={fontSize} />
        <p>{i18n.language === "en" ? "中" : "En"}</p>
      </a>
    </div>
  );
};

export default Language;
