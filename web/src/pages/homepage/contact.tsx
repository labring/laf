import React from "react";
import { useTranslation } from "react-i18next";

import useSiteSettingStore from "../siteSetting";

type Props = {};

const Contact = (props: Props) => {
  const { t } = useTranslation();
  const { siteSettings } = useSiteSettingStore();
  return (
    <div className="py-12 pb-2 text-center lg:pb-24 lg:pt-0">
      <a
        href={siteSettings.laf_business_url?.value}
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
