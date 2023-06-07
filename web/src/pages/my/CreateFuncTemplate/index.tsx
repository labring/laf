import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, HStack, Radio, RadioGroup, useColorMode, VStack } from "@chakra-ui/react";
import clsx from "clsx";

import { TextIcon } from "@/components/CommonIcon";
import FileTypeIcon from "@/components/FileTypeIcon";

import AddDependenceModal from "../Mods/AddDependenceModal";
import AddFunctionModal from "../Mods/AddFunctionModal";

import MonacoEditor from "@/pages/app/functions/mods/FunctionPanel/FunctionTemplate/MonacoEditor";

export default function CreateFuncTemplate() {
  // const data = {

  // }
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const [packageList, setPackageList] = useState<any[]>([]);
  const [functionList, setFunctionList] = useState<any[]>([]);
  const [currentFunction, setCurrentFunction] = useState<any>(undefined);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    let id = null;
    const pathname = location.pathname;
    if (pathname.startsWith("/my/edit/")) {
      id = pathname.substring("/my/edit/".length);
      setIsEdit(true);
      console.log(id);
    } else if (pathname === "/my/create") {
    } else {
      console.log("error");
    }
  }, [location.pathname]);

  type FormData = {
    title: string;
    visibility: string;
    description: string;
  };

  const {
    register,
    handleSubmit,
    control,
    // formState: { errors },
  } = useForm<FormData>({
    // mode: "onChange",
  });

  const onSubmit = (data: FormData) => {
    console.log({
      ...data,
      functionList,
      packageList,
    });
  };

  return (
    <div
      className={clsx("h-screen", colorMode === "dark" ? "" : "bg-white")}
      style={{ display: "flex", flexDirection: "column", overflowX: "hidden" }}
    >
      <div className="flex h-12 items-center pl-16 text-lg">
        <a href="/my" className="text-second">
          {t("Template.MyTemplate")}
        </a>
        <span className="px-2">{`>`}</span>
        <span>{isEdit ? t("Template.Edit") : t("Create")}</span>
      </div>
      <HStack className="px-16" spacing={8}>
        <VStack className="flex h-full w-10/12">
          <div className="flex h-12 w-full items-center border-b-2">
            <input
              {...register("title", { required: true })}
              className="h-8 w-full border-l-2 border-primary-600 bg-transparent pl-4 text-2xl font-medium"
              style={{ outline: "none", boxShadow: "none" }}
              placeholder="Title"
            />
          </div>
          <Controller
            control={control}
            name="visibility"
            rules={{ required: true }}
            render={({ field }) => (
              <RadioGroup className="w-full pt-2" {...field}>
                <Radio value="public">{t("Template.public")}</Radio>
                <Radio value="private" className="ml-4">
                  {t("Template.private")}
                </Radio>
              </RadioGroup>
            )}
          />
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
              {...register("description")}
            />
          </div>
          <div className="w-full">
            <div className="h-[400px] w-full">
              <MonacoEditor
                value={currentFunction?.code || ""}
                onChange={(value: string | undefined) => {
                  setFunctionList(
                    functionList.map((item) => {
                      if (item.name === currentFunction.name) {
                        return {
                          ...item,
                          code: value,
                        };
                      }
                      return item;
                    }),
                  );
                }}
                title={currentFunction?.name || ""}
              />
            </div>
            {/* <AddFunctionModal>
              <button
                className="h-10 w-full rounded-md border-2 text-lg mt-4"
              >
                + 添加函数
              </button>
            </AddFunctionModal> */}
          </div>
        </VStack>

        <VStack className="flex h-full w-2/12">
          <Box className="w-full border-b-2 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">{t("Template.Function")}</span>
              <span className="cursor-pointer">
                <AddFunctionModal functionList={functionList} setFunctionList={setFunctionList}>
                  <AddIcon />
                </AddFunctionModal>
              </span>
            </div>
            <Box>
              {functionList.map((item) => {
                return (
                  <div
                    key={item.name}
                    className="flex h-8 cursor-pointer items-center rounded-md font-medium hover:bg-gray-100"
                    onClick={() => {
                      setCurrentFunction(item);
                    }}
                  >
                    <FileTypeIcon type="ts" />
                    <span className="pl-1 text-lg">{item.name}</span>
                  </div>
                );
              })}
            </Box>
          </Box>

          <Box className="w-full border-b-2 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">依赖</span>
              <span className="cursor-pointer">
                <AddDependenceModal packageList={packageList} setPackageList={setPackageList}>
                  <AddIcon />
                </AddDependenceModal>
              </span>
            </div>
            <Box>
              {packageList.map((item) => {
                return (
                  <Box
                    key={item.package.name}
                    className="flex h-8 w-full items-center justify-between font-medium"
                  >
                    <div>
                      <FileTypeIcon type="npm" />
                      <span className="pl-1">{item.package.name}</span>
                    </div>
                    <span>{item.package.version}</span>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* <Box className="w-full">
            <span className="text-xl font-bold">环境变量</span>
            <Box>
              <div className="flex h-8 items-center font-medium">OPEN_AI_KEY</div>
            </Box>
          </Box> */}
        </VStack>
      </HStack>

      <div className="mt-6 flex justify-center">
        <Button className="mr-12 w-36" variant={"secondary"} onClick={handleSubmit(onSubmit)}>
          {t("Save")}
        </Button>
        <Button className="w-36" onClick={handleSubmit(onSubmit)}>
          {t("Publish")}
        </Button>
      </div>
    </div>
  );
}
