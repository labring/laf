import React from "react";
import { useTranslation } from "react-i18next";
import { Box, HStack, useColorMode, VStack } from "@chakra-ui/react";
import clsx from "clsx";

import HeadBar from "../../Mods/HeadBar";

import MonacoEditor from "@/pages/app/functions/mods/FunctionPanel/FunctionTemplate/MonacoEditor";
// import { useParams } from 'react-router-dom';
import TemplateInfo from "@/pages/app/functions/mods/FunctionPanel/FunctionTemplate/TemplateInfo";

// React 函数组件
const FuncTemplateItem = () => {
  // const { templateId } = useParams();
  const { colorMode } = useColorMode();
  const { t } = useTranslation();

  return (
    <div className={clsx("h-screen", colorMode === "dark" ? "" : "bg-white")}>
      <HeadBar />
      <div className="flex h-12 items-center pl-16 text-lg">
        <a href="/market" className="text-second">
          {t("market.funcTemplate")}
        </a>
        <span className="px-2">{`>`}</span>
        <span>{t("Template.Details")}</span>
      </div>
      <HStack className="h-full px-16" spacing={8}>
        <VStack className="h-full w-full">
          <Box className="w-full">
            <div className="pb-2 text-xl font-semibold">用户登录和注册</div>
            <div className="pb-2 text-second">获取用户登录信息</div>
            <MonacoEditor value="" colorMode={colorMode} />
          </Box>
        </VStack>
        <div className="h-full w-3/12">
          <TemplateInfo />
        </div>
      </HStack>
    </div>
  );
};

export default FuncTemplateItem;
