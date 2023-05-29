import { useTranslation } from "react-i18next";
import { Box, Button, HStack, Radio, RadioGroup, useColorMode, VStack } from "@chakra-ui/react";
import clsx from "clsx";

import { TextIcon } from "@/components/CommonIcon";
import FileTypeIcon from "@/components/FileTypeIcon";

// import FunctionEditor from "@/components/Editor/FunctionEditor";
import HeadBar from "../../Mods/HeadBar";

import MonacoEditor from "@/pages/app/functions/mods/FunctionPanel/FunctionTemplate/MonacoEditor";

export default function CreateFuncTemplate() {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div className={darkMode ? "h-screen" : "h-screen bg-white"}>
      <HeadBar />
      <div className="flex h-12 items-center pl-16 text-lg">
        <a href="/market/mine" className="text-second">
          {t("Template.MyTemplate")}
        </a>
        <span className="px-2">{`>`}</span>
        <span>{t("Create")}</span>
      </div>
      <HStack className="px-16" spacing={8}>
        <VStack className="flex h-full w-10/12">
          <div className="flex h-12 w-full items-center border-b-2">
            <input
              className="h-8 w-full border-l-2 border-primary-600 bg-transparent pl-4 text-2xl font-medium"
              style={{ outline: "none", boxShadow: "none" }}
              placeholder="Title"
            />
          </div>
          <RadioGroup onChange={(e) => console.log(e)} className="w-full pt-2">
            <Radio value="public">{t("Template.public")}</Radio>
            <Radio value="private" className="ml-4">
              {t("Template.private")}
            </Radio>
          </RadioGroup>
          <div
            className={clsx(
              "flex w-full items-center rounded-md pl-1",
              darkMode ? "focus-within:bg-gray-800" : "focus-within:bg-[#F4F6F8]",
            )}
          >
            <TextIcon fontSize={18} color={"#D9D9D9"} />
            <input
              placeholder="输入函数模板介绍信息"
              className="w-full bg-transparent py-2 pl-2 text-lg"
              style={{ outline: "none", boxShadow: "none" }}
            />
          </div>
          <div className="h-[300px] w-full">
            <MonacoEditor
              value={`import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  console.log('server side code')
  return { data: 'hi, laf' }
}
`}
              colorMode={colorMode}
            />
          </div>
          <button className="h-10 w-full rounded-md border-2 text-lg">+ 添加函数</button>
        </VStack>

        <VStack className="flex h-full w-2/12">
          <Box className="w-full">
            <span className="text-xl font-bold">函数</span>
            <Box>
              <div className="flex h-8 items-center font-medium">
                <FileTypeIcon type="ts" />
                <span className="pl-1 text-lg">register</span>
              </div>
              <div className="flex h-8 items-center font-medium">
                <FileTypeIcon type="ts" />
                <span className="pl-1 text-lg">login</span>
              </div>
            </Box>
          </Box>
          <Box className="w-full">
            <span className="text-xl font-bold">依赖</span>
            <Box className="flex h-8 items-center justify-between font-medium">
              <div>
                <FileTypeIcon type="npm" />
                <span className="pl-1">ChatGPT</span>
              </div>
              <span>5.2.1</span>
            </Box>
          </Box>
          <Box className="w-full">
            <span className="text-xl font-bold">环境变量</span>
            <Box>
              <div className="flex h-8 items-center font-medium">OPEN_AI_KEY</div>
            </Box>
          </Box>
        </VStack>
      </HStack>

      <div className="mt-6 flex justify-center">
        <Button className="mr-12 w-36" variant={"secondary"}>
          保存
        </Button>
        <Button className="w-36">发布</Button>
      </div>
    </div>
  );
}
