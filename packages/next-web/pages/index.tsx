import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Button, Input } from "@chakra-ui/react";
import React from "react";
import Layout from "../components/Layout";
import { useTranslation } from "next-i18next";

export default function Index() {
  const { t } = useTranslation("common");

  return (
    <Layout>
      <div className="w-9/12 mt-10 mx-auto">
        <div className="flex">
          <div className="bg-white flex-1 mr-2">
            <Input placeholder={t("ViewBlog")} />
          </div>
          <Button>{t("Welcome")}</Button>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps = async ({ locale }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};
