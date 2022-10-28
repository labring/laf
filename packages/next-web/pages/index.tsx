import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import {
  Button,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Spinner,
} from "@chakra-ui/react";
import { AddIcon, CopyIcon, Search2Icon } from "@chakra-ui/icons";

import Editor from "@monaco-editor/react";

import React from "react";
import Layout from "../components/Layout";
import { useTranslation } from "next-i18next";
import request from "../utils/request";
import { useQuery } from "@tanstack/react-query";

export default function Index() {
  const { t } = useTranslation("common");

  const appListRes = useQuery(["getAppDetailInfo"], () => {
    return request.get("/api/app");
  });

  return (
    <Layout>
      <div className="w-8/12 mt-10 mx-auto">
        <div className="flex mb-8">
          <div className="bg-white flex-1 mr-2">
            <InputGroup>
              <InputLeftElement
                style={{ height: 48 }}
                pointerEvents="none"
                children={<Search2Icon color="gray.300" />}
              />
              <Input placeholder={t("Search")} size="lg" />
            </InputGroup>
          </div>
          <Button
            size={"lg"}
            style={{ padding: "0 40px" }}
            leftIcon={<AddIcon />}
          >
            {t("NewApp")}
          </Button>
        </div>

        <Editor
          height="100px"
          defaultLanguage="javascript"
          defaultValue="// some comment"
        />

        {appListRes.isLoading ? (
          <Center>
            <Spinner size="xl" />
          </Center>
        ) : (
          <div>
            {(appListRes.data?.data?.created || []).map((item: any) => {
              return (
                <div
                  key={item.appid}
                  className="flex justify-between items-center p-4 bg-white rounded-lg shadow mb-8"
                >
                  <div style={{ width: 300 }}>
                    <Link href="https://chakra-ui.com" isExternal>
                      <span className="text-base font-semibold">
                        {item.name}
                      </span>
                    </Link>

                    <p>
                      App ID: {item.appid} <CopyIcon />
                    </p>
                  </div>
                  <div className="flex-1">
                    <p>规格: {item.spec.name}</p>
                    <p>创建时间: {item.created_at}</p>
                  </div>
                  <div>
                    <a className="mr-4">开发</a>
                    <a>配置</a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
