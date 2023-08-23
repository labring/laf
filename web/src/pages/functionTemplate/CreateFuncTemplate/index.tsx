import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { AddIcon, ChevronRightIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, Button, Radio, RadioGroup, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { TextIcon } from "@/components/CommonIcon";
import ConfirmButton from "@/components/ConfirmButton";
import FileTypeIcon from "@/components/FileTypeIcon";

import {
  useCreateFunctionTemplateMutation,
  useDeleteFunctionTemplateMutation,
  useUpdateFunctionTemplateMutation,
} from "../service";

import AddDependenceModal from "./Mods/AddDependenceModal";
import AddEnvironmentsModal from "./Mods/AddEnvironmentsModal";
import AddFunctionModal from "./Mods/AddFunctionModal";

import MonacoEditor from "@/pages/functionTemplate/Mods/MonacoEditor";
import { useGetOneFunctionTemplateQuery } from "@/pages/functionTemplate/service";
import useGlobalStore from "@/pages/globalStore";

export default function CreateFuncTemplate() {
  const createFunctionMutation = useCreateFunctionTemplateMutation();
  const updateFunctionMutation = useUpdateFunctionTemplateMutation();
  const deleteFunctionMutation = useDeleteFunctionTemplateMutation();

  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const [packageList, setPackageList] = useState<any[]>([]);
  const [functionList, setFunctionList] = useState<any[]>([]);
  const [currentFunction, setCurrentFunction] = useState<any>();
  const [environments, setEnvironments] = useState<any[]>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [defaultFunction, setDefaultFunction] = useState<any>();
  const [templateId, setTemplateId] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useGlobalStore();

  type FormData = {
    name: string;
    visibility: string;
    description: string;
    tags: string[];
  };
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: defaultFunction,
  });

  useGetOneFunctionTemplateQuery(
    { id: templateId },
    {
      enabled: isEdit,
      onSuccess: (data: any) => {
        setCurrentFunction(data.data[0].items[0]);
        setFunctionList(data.data[0].items);
        setPackageList(
          data.data[0].dependencies.map((item: any) => {
            const [name, version] = item.split("@");
            return {
              package: {
                name: name,
                version: version,
              },
            };
          }),
        );
        setEnvironments(data.data[0].environments);
        setDefaultFunction({
          name: data.data[0].name,
          visibility: data.data[0].private ? "private" : "public",
          description: data.data[0].description,
        });
      },
    },
  );

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.endsWith("/edit")) {
      const pattern = /\/([^/]+)\/edit$/;
      const match = pathname.match(pattern);
      const id = match ? match[1] : "";
      setIsEdit(true);
      setTemplateId(id);
    }
  }, [location.pathname]);

  useEffect(() => {
    reset(defaultFunction);
  }, [defaultFunction, reset]);

  const onSubmit = async (data: FormData) => {
    const { name, visibility, description } = data;

    if (functionList.length === 0) {
      showError(t("Template.FunctionListEmpty"));
      return;
    }
    const mutation = isEdit ? updateFunctionMutation : createFunctionMutation;
    const mutationArgs = {
      name,
      private: visibility === "private",
      description,
      items: functionList.map((item) => ({
        name: item.name,
        description: item.desc,
        methods: item.methods,
        code: item.source.code || "",
      })),
      dependencies: packageList.map((item) => ({
        name: item.package.name,
        spec: item.package.version,
      })),
      environments: environments,
    };

    const res = await mutation.mutateAsync(
      isEdit ? { id: templateId, functionTemplateId: templateId, ...mutationArgs } : mutationArgs,
    );

    if (!res?.error) {
      showSuccess(
        isEdit ? t("Update function template success") : t("Create function template success"),
      );
    }
    navigate(-1);
  };

  return (
    <div className={clsx("flex flex-col px-28 2xl:px-48", colorMode === "dark" ? "" : "bg-white")}>
      <div className="flex pt-12 text-lg">
        <span
          className="cursor-pointer text-second"
          onClick={() => {
            navigate(-1);
          }}
        >
          {t("HomePage.NavBar.funcTemplate")}
        </span>
        <span className="flex items-center px-3">
          <ChevronRightIcon />
        </span>
        <span>{isEdit ? t("Template.Edit") : t("Template.Create")}</span>
      </div>

      <div className="flex h-full pt-9">
        <div className="mr-9 h-full w-4/5">
          <div className="mb-4 border-b border-dotted pb-2">
            <div className="flex h-12 w-full items-center border-b-[2px]">
              <input
                {...register("name", { required: true })}
                className="h-7 w-full border-l-2 border-primary-600 bg-transparent pl-4 text-2xl font-medium"
                style={{ outline: "none", boxShadow: "none" }}
                placeholder="Title"
              />
            </div>
            {errors.name && (
              <span className="text-red-500">{t("Template.Please enter template name")}</span>
            )}
            <Controller
              control={control}
              name="visibility"
              rules={{ required: true }}
              render={({ field }) => (
                <RadioGroup className="w-full pt-3" {...field}>
                  <Radio value="public">{t("Template.public")}</Radio>
                  <Radio value="private" className="ml-4">
                    {t("Template.private")}
                  </Radio>
                </RadioGroup>
              )}
            />
            {errors.visibility && (
              <span className="text-red-500">
                {t("Template.Please select template permission")}
              </span>
            )}
            <div
              className={clsx(
                "mt-2 flex w-full items-center rounded-md",
                darkMode ? "focus-within:bg-gray-800" : "focus-within:bg-[#F4F6F8]",
              )}
            >
              <TextIcon fontSize={18} color={"gray.400"} />
              <input
                placeholder={String(t("Template.Description"))}
                className="w-full bg-transparent py-2 pl-2 text-lg"
                style={{ outline: "none", boxShadow: "none" }}
                {...register("description")}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <div className="scrollbar-thin mb-2 mr-8 flex w-full overflow-auto">
              {functionList.map((item) => {
                return (
                  <div
                    key={item.name}
                    className={clsx(
                      "mb-2 mr-2 cursor-pointer rounded-md border px-8 py-1 text-[14px]",
                      !darkMode && "bg-[#F6F8F9]",
                      "hover:border-blue-400 hover:bg-blue-100 hover:text-blue-700",
                      currentFunction?.name === item.name &&
                        "border-blue-400 bg-blue-100 text-blue-700",
                    )}
                    onClick={() => {
                      setCurrentFunction(item);
                    }}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>
            <AddFunctionModal
              functionList={functionList}
              setFunctionList={setFunctionList}
              setCurrentFunction={setCurrentFunction}
              isEdit={false}
            >
              <Button
                variant={"secondary"}
                onClick={() => {
                  setCurrentFunction({ name: "" });
                }}
              >
                <AddIcon boxSize={2.5} />
                <span className="pl-4">{t("FunctionPanel.AddFunction")}</span>
              </Button>
            </AddFunctionModal>
          </div>

          <div className="overflow-auto xl:h-[45vh] 2xl:h-[55vh]">
            {currentFunction && (
              <MonacoEditor
                value={currentFunction.source.code}
                onChange={(value: string | undefined) => {
                  setFunctionList(
                    functionList.map((item) => {
                      if (item.name === currentFunction.name) {
                        return {
                          ...item,
                          source: {
                            code: value,
                          },
                        };
                      }
                      return item;
                    }),
                  );
                }}
                title={currentFunction?.name}
                colorMode={colorMode}
                currentFunction={currentFunction}
                setCurrentFunction={setCurrentFunction}
                functionList={functionList}
                setFunctionList={setFunctionList}
              />
            )}
          </div>

          <div className="mt-4 flex justify-center pb-4">
            {isEdit && (
              <ConfirmButton
                headerText={t("Delete")}
                bodyText={t("Template.ConfirmDeleteTemplate")}
                onSuccessAction={async () => {
                  const res = await deleteFunctionMutation.mutateAsync({ id: templateId });
                  if (!res.error) {
                    showSuccess(t("DeleteSuccess"));
                    navigate(-1);
                  }
                }}
              >
                <Button className="mr-4 w-36 bg-red-100" variant={"warnText"}>
                  {t("Delete")}
                </Button>
              </ConfirmButton>
            )}
            <Button className="w-36" onClick={handleSubmit(onSubmit)}>
              {isEdit ? t("Template.Save") : t("Publish")}
            </Button>
          </div>
        </div>
        <div className="flex h-[70vh] w-1/5 flex-col">
          <Box className={clsx("border-b-[1px]", functionList.length === 0 && "pb-2")}>
            <div className="flex items-center">
              <span className="text-xl font-semibold">{t("Template.Function")}</span>
            </div>
            <Box className="max-h-48 overflow-auto">
              {functionList.map((item) => {
                return (
                  <div
                    key={item.name}
                    className="my-3 flex items-center justify-between rounded-md py-1 font-medium hover:opacity-100"
                  >
                    <div className="flex w-10/12 items-center">
                      <FileTypeIcon type="ts" fontSize={18} />
                      <span className="truncate pl-1 text-lg">{item.name}</span>
                    </div>
                  </div>
                );
              })}
            </Box>
          </Box>
          <Box className={clsx("mt-3 border-b-[1px]", packageList.length === 0 && "pb-2")}>
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">{t("Template.Dependency")}</span>
              <AddDependenceModal packageList={packageList} setPackageList={setPackageList}>
                <AddIcon className="cursor-pointer" />
              </AddDependenceModal>
            </div>
            <Box className="max-h-36 overflow-auto">
              {packageList.map((item) => {
                return (
                  <Box
                    key={item.package.name}
                    className="my-3 flex items-center justify-between py-1 font-medium"
                  >
                    <div>
                      <FileTypeIcon type="npm" />
                      <span className="pl-1">{item.package.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="pr-2">{item.package.version}</span>
                      <DeleteIcon
                        boxSize={3}
                        color={"gray.400"}
                        className="cursor-pointer hover:text-gray-800"
                        onClick={() => {
                          setPackageList(
                            packageList.filter((pkg) => pkg.package.name !== item.package.name),
                          );
                        }}
                      />
                    </div>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Box className={clsx("mt-3 border-b-[1px]", environments.length === 0 && "pb-2")}>
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">{t("Template.EnvironmentVariables")}</span>
              <span className="cursor-pointer">
                <AddEnvironmentsModal environments={environments} setEnvironments={setEnvironments}>
                  <AddIcon />
                </AddEnvironmentsModal>
              </span>
            </div>
            <Box className="max-h-36 overflow-auto">
              {environments.map((item) => {
                return (
                  <Box key={item.name} className="my-5 flex justify-between">
                    <div className="flex w-5/12 truncate font-medium">{item.name}</div>
                    <div className="ml-8 truncate">{item.value}</div>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </div>
      </div>
    </div>
  );
}
