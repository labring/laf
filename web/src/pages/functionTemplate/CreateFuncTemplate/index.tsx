import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { AddIcon, ChevronRightIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, Button, Radio, RadioGroup, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { TextIcon } from "@/components/CommonIcon";
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
    } else {
      console.log("error");
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
    navigate("/market/templates/my");
  };

  return (
    <div className={clsx("flex flex-col px-20 2xl:px-48", colorMode === "dark" ? "" : "bg-white")}>
      <div className="pt-8 text-lg">
        <a href="/market/templates/my" className="text-second">
          {t("Template.MyTemplate")}
        </a>
        <span className="px-3">
          <ChevronRightIcon />
        </span>
        <span>{isEdit ? t("Template.Edit") : t("Template.Create")}</span>
      </div>

      <div className="flex h-full pt-9">
        <div className="mr-9 h-full w-4/5">
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
            <span className="text-red-500">{t("Template.Please select template permission")}</span>
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

          <AddFunctionModal
            functionList={functionList}
            setFunctionList={setFunctionList}
            isEdit={false}
          >
            <button
              className={clsx(
                "my-2 flex h-10 w-full items-center justify-center rounded-md border-[1px] text-lg",
                darkMode ? "" : " bg-[#F4F6F8]",
              )}
            >
              <AddIcon boxSize={2.5} />
              <span className="pl-4">{t("FunctionPanel.AddFunction")}</span>
            </button>
          </AddFunctionModal>
          <div className="mt-4 h-[50vh] overflow-auto">
            {functionList.map((functionItem) => (
              <div className="mb-4 h-[40vh] w-full" key={functionItem.name}>
                <MonacoEditor
                  value={functionItem.source.code}
                  onChange={(value: string | undefined) => {
                    setFunctionList(
                      functionList.map((item) => {
                        if (item.name === functionItem.name) {
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
                  title={functionItem?.name}
                  colorMode={colorMode}
                  currentFunction={functionItem}
                  functionList={functionList}
                  setFunctionList={setFunctionList}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center pb-4">
            {isEdit && (
              <Button
                className="mr-12 w-36 bg-red-100"
                variant={"warnText"}
                onClick={async () => {
                  await deleteFunctionMutation.mutateAsync({ id: templateId });
                  showSuccess(t("DeleteSuccess"));
                  navigate("/market/templates/my");
                }}
              >
                {t("Delete")}
              </Button>
            )}
            <Button className="w-36" onClick={handleSubmit(onSubmit)}>
              {isEdit ? t("Template.Save") : t("Publish")}
            </Button>
          </div>
        </div>

        <div className="flex h-[70vh] w-1/5 flex-col overflow-auto">
          <Box className={clsx("border-b-[1px]", functionList.length === 0 && "pb-2")}>
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">{t("Template.Function")}</span>
              <AddFunctionModal
                functionList={functionList}
                setFunctionList={setFunctionList}
                isEdit={false}
              >
                <AddIcon className="cursor-pointer" />
              </AddFunctionModal>
            </div>
            <Box>
              {functionList.map((item) => {
                return (
                  <div
                    key={item.name}
                    className={clsx(
                      "group my-3 flex cursor-pointer items-center justify-between rounded-md py-1 font-medium hover:opacity-100",
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100",
                    )}
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
            <Box>
              {packageList.map((item) => {
                return (
                  <Box
                    key={item.package.name}
                    className={clsx(
                      "group my-3 flex cursor-pointer items-center justify-between rounded-md py-1 font-medium",
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100",
                    )}
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
                        className={clsx(
                          "mr-2 opacity-0 hover:text-gray-800 group-hover:opacity-100",
                        )}
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
            <Box>
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
