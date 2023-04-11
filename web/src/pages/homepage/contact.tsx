import React from "react";
import { useTranslation } from "react-i18next";

type Props = {};

const Contact = (props: Props) => {
  const { t } = useTranslation();
  return (
    <div className="py-12 pb-2 text-center lg:pb-24 lg:pt-0">
      <a
        href="https://www.wenjuan.com/s/I36ZNbl/"
        target="_blank"
        className=" bg-primary rounded px-16 py-5 text-2xl text-white"
        rel="noreferrer"
      >
        {t(`HomePage.NavBar.contact`)}
      </a>
    </div>
  );
};

export default Contact;
