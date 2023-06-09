import { useTranslation } from "react-i18next";
// import { useNavigate } from "react-router-dom";
import { Box, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import TemplateInfo from "../Mods/TemplateInfo";

import MonacoEditor from "@/pages/functionTemplate/Mods/MonacoEditor";
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
    ],
    packageList: [
      {
        name: "dd-trace",
        version: "1.0.0",
      },
    ],
  };

  // const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { t } = useTranslation();

  return (
    <div className={clsx("flex flex-1 flex-col", colorMode === "dark" ? "" : "bg-white")}>
      <div className="flex h-12 items-center pl-16 text-lg">
        <a href="/function-templates" className="text-second">
          {t("market.funcTemplate")}
        </a>
        <span className="px-2">{`>`}</span>
        <span>{t("Template.Details")}</span>
      </div>
      <div className="flex px-16">
        <div className="w-10/12 pr-8">
          <Box>
            <div className="pb-2 text-xl font-semibold">{template.title}</div>
            <div className="pb-4 text-second">{template.description}</div>
            {(template.functionList || []).map((item) => {
              return (
                <div key={item.name} className="mb-4 h-[60vh]">
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
        </div>
        <div className="h-full w-2/12">
          <TemplateInfo
            author="test"
            functionList={template.functionList}
            packageList={template.packageList}
            isFromMarket={true}
          />
        </div>
      </div>
    </div>
  );
};

export default FuncTemplateItem;
