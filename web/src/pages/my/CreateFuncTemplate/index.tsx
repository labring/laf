import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import { Box, Button, Radio, RadioGroup, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { TextIcon } from "@/components/CommonIcon";
import ConfirmButton from "@/components/ConfirmButton";
import FileTypeIcon from "@/components/FileTypeIcon";
import InputTag from "@/components/InputTag";

import AddDependenceModal from "../Mods/AddDependenceModal";
import AddFunctionModal from "../Mods/AddFunctionModal";

import MonacoEditor from "@/pages/functionTemplate/Mods/MonacoEditor";

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
    tags: string[];
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
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
    <div className={clsx("flex flex-grow flex-col", colorMode === "dark" ? "" : "bg-white")}>
      <div className="flex h-12 items-center pl-16 text-lg">
        <a href="/my" className="text-second">
          {t("Template.MyTemplate")}
        </a>
        <span className="px-2">{`>`}</span>
        <span>{isEdit ? t("Template.Edit") : t("Template.Create")}</span>
      </div>
      <div className="flex h-full px-16">
        <div className="h-full w-10/12">
          <div className="flex h-12 w-full items-center border-b-2">
            <input
              {...register("title", { required: true })}
              className="h-8 w-full border-l-2 border-primary-600 bg-transparent pl-4 text-2xl font-medium"
              style={{ outline: "none", boxShadow: "none" }}
              placeholder="Title"
            />
          </div>
          {errors.title && <span className="text-red-500">This field is required</span>}
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
          {errors.visibility && <span className="text-red-500">This field is required</span>}

          <div className="mt-1 w-full">
            <Controller
              name="tags"
              control={control}
              render={({ field: { onChange, value } }) => (
                <InputTag value={value || []} onChange={onChange} tagList={[]} />
              )}
            />
          </div>

          <div
            className={clsx(
              "mb-2 mt-1 flex w-full items-center rounded-md pl-1",
              darkMode ? "focus-within:bg-gray-800" : "focus-within:bg-[#F4F6F8]",
            )}
          >
            <TextIcon fontSize={18} color={"#D9D9D9"} />
            <input
              placeholder={String(t("Template.Description"))}
              className="w-full bg-transparent py-2 pl-2 text-lg"
              style={{ outline: "none", boxShadow: "none" }}
              {...register("description")}
            />
          </div>
          {currentFunction && (
            <div className="h-[55vh] w-full">
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
                colorMode={colorMode}
              />
            </div>
          )}

          {!currentFunction && (
            <AddFunctionModal
              functionList={functionList}
              setFunctionList={setFunctionList}
              setCurrentFunction={setCurrentFunction}
            >
              <button className="mt-4 h-10 w-full rounded-md border-2 text-lg">
                + {t("FunctionPanel.AddFunction")}
              </button>
            </AddFunctionModal>
          )}
        </div>

        <div className="ml-8 flex h-[75vh] w-2/12 flex-col overflow-auto">
          <Box className="mb-4 w-full border-b-2 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">{t("Template.Function")}</span>
              <span className="cursor-pointer">
                <AddFunctionModal
                  functionList={functionList}
                  setFunctionList={setFunctionList}
                  setCurrentFunction={setCurrentFunction}
                >
                  <AddIcon />
                </AddFunctionModal>
              </span>
            </div>
            <Box>
              {functionList.map((item) => {
                return (
                  <div
                    key={item.name}
                    className={clsx(
                      "group my-1 flex h-8 cursor-pointer items-center justify-between rounded-md pl-2 font-medium hover:opacity-100",
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100",
                      currentFunction?.name === item.name && darkMode ? "bg-gray-700" : "",
                      currentFunction?.name === item.name && !darkMode ? "bg-gray-100" : "",
                    )}
                    onClick={() => {
                      setCurrentFunction(item);
                    }}
                  >
                    <div>
                      <FileTypeIcon type="ts" />
                      <span className="pl-1 text-lg">{item.name}</span>
                    </div>
                    <ConfirmButton
                      onSuccessAction={async () => {
                        const updatedFunctionList = functionList.filter(
                          (func) => func.name !== item?.name,
                        );
                        setFunctionList(updatedFunctionList);
                        if (currentFunction?.name === item.name) {
                          setCurrentFunction(updatedFunctionList[0]);
                        }
                      }}
                      headerText={String(t("Delete"))}
                      bodyText={String(t("FunctionPanel.DeleteConfirm"))}
                    >
                      <CloseIcon
                        boxSize={2}
                        color={"gray.400"}
                        className={clsx(
                          "mr-2 opacity-0 hover:text-gray-800 group-hover:opacity-100",
                          currentFunction?.name === item.name ? "opacity-100" : "",
                        )}
                      />
                    </ConfirmButton>
                  </div>
                );
              })}
            </Box>
          </Box>

          <Box className="w-full border-b-2 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">{t("Template.Dependency")}</span>
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
                    className="my-1 flex h-8 w-full items-center justify-between pl-2 font-medium"
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
        </div>
      </div>
      <div className="mt-4 flex justify-center">
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
