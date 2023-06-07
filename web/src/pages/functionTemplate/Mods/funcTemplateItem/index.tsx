import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, HStack, useColorMode, VStack } from "@chakra-ui/react";
import clsx from "clsx";

import { HeartIcon } from "@/components/CommonIcon";

// import HeadBar from "../../Mods/HeadBar";
import MonacoEditor from "@/pages/app/functions/mods/FunctionPanel/FunctionTemplate/MonacoEditor";
import TemplateInfo from "@/pages/app/functions/mods/FunctionPanel/FunctionTemplate/TemplateInfo";

const FuncTemplateItem = () => {
  const template = {
    title: "用户登录和注册",
    description: "获取用户登录信息",
    likes: 112,
    liked: false,
    functionList: [
      {
        name: "register",
        code: `import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  console.log('Hello World')
  return { data: 'hi, laf' }
}`,
      },
      {
        name: "login",
        code: `import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  console.log('Hello World')
  return { data: 'hi, laf' }
}`,
      },
    ],
    packageList: [
      {
        name: "dd-trace",
        version: "1.0.0",
      },
    ],
  };

  const [likes, setLikes] = useState(112);
  const [liked, setLiked] = useState(false);
  const { colorMode } = useColorMode();
  const { t } = useTranslation();

  return (
    <div
      className={clsx("h-screen", colorMode === "dark" ? "" : "bg-white")}
      style={{ display: "flex", flexDirection: "column", overflowX: "hidden" }}
    >
      {/* <HeadBar /> */}
      <div className="flex h-12 items-center pl-16 text-lg">
        <a href="/function-templates" className="text-second">
          {t("market.funcTemplate")}
        </a>
        <span className="px-2">{`>`}</span>
        <span>{t("Template.Details")}</span>
      </div>
      <HStack className="h-full px-16" spacing={8} style={{ flexGrow: 1 }}>
        <VStack className="h-full w-full">
          <Box className="w-full">
            <div className="pb-2 text-xl font-semibold">{template.title}</div>
            <div className="pb-4 text-second">{template.description}</div>
            {(template.functionList || []).map((item) => {
              return (
                <div key={item.name} className="mb-4 h-[200px]">
                  <MonacoEditor
                    value={item.code}
                    colorMode={colorMode}
                    readOnly={true}
                    title={item.name}
                  />
                </div>
              );
            })}
          </Box>
        </VStack>
        <div className="h-full w-3/12">
          <Box className="flex w-full justify-between pb-8">
            <div
              className={clsx(
                "flex cursor-pointer items-center rounded-2xl border-2 px-3 text-xl",
                liked ? "" : "text-gray-400",
              )}
              onClick={() => {
                if (liked) {
                  setLikes(likes - 1);
                  setLiked(false);
                } else {
                  setLikes(likes + 1);
                  setLiked(true);
                }
              }}
            >
              <HeartIcon />
              <span className="pl-1">{likes}</span>
            </div>
            <Button
              onClick={(e) => {
                console.log("use template");
              }}
            >
              {t("Template.useTemplate")}
            </Button>
          </Box>
          <TemplateInfo
            author="test"
            functionList={template.functionList}
            packageList={template.packageList}
          />
        </div>
      </HStack>
    </div>
  );
};

export default FuncTemplateItem;
