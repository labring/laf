import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  FormControl,
  FormErrorMessage,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "i18next";

import { MoreTemplateIcon, TextIcon } from "@/components/CommonIcon";
import InputTag from "@/components/InputTag";
import { DEFAULT_CODE, SUPPORTED_METHODS } from "@/constants";

import { useCreateFunctionMutation, useUpdateFunctionMutation } from "../../../service";
import useFunctionStore from "../../../store";

import { TFunctionTemplate, TMethod } from "@/apis/typing";
import FunctionTemplate from "@/pages/functionTemplate";
import TemplateCard from "@/pages/functionTemplate/Mods/TemplateCard";
import {
  useGetFunctionTemplatesQuery,
  useGetRecommendFunctionTemplatesQuery,
} from "@/pages/functionTemplate/service";
import useTemplateStore from "@/pages/functionTemplate/store";
import useGlobalStore from "@/pages/globalStore";

const CreateModal = (props: {
  functionItem?: any;
  children?: React.ReactElement;
  tagList?: any;
  aiCode?: string;
  hideContextMenu?: () => void;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { showSuccess, currentApp } = useGlobalStore();

  const { functionItem, children = null, tagList, aiCode, hideContextMenu } = props;
  const isEdit = !!functionItem;
  const navigate = useNavigate();
  const [searchKey, setSearchKey] = useState("");
  const [templateOpen, setTemplateOpen] = useState(false);
  const { recentFunctionList, setRecentFunctionList, setCurrentFunction, currentFunction } =
    useFunctionStore();
  const { setShowTemplateItem } = useTemplateStore();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const templateId = searchParams.get("templateId");
    if (!templateId) return;
    localStorage.setItem("templateId", templateId);
  }, []);

  const defaultValues = {
    name: functionItem?.name || "",
    description: functionItem?.desc || "",
    websocket: !!functionItem?.websocket,
    methods: functionItem?.methods || ["GET", "POST"],
    code: functionItem?.source?.code || aiCode || DEFAULT_CODE || "",
    tags: functionItem?.tags || [],
  };

  type FormData = {
    name: string;
    description: string;
    websocket: boolean;
    methods: TMethod[];
    code: string;
    tags: string[];
  };

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

  const createFunctionMutation = useCreateFunctionMutation();
  const updateFunctionMutation = useUpdateFunctionMutation();

  const InitialTemplateList = useGetRecommendFunctionTemplatesQuery(
    {
      page: 1,
      pageSize: 3,
      keyword: "",
      type: "default",
      asc: 1,
      sort: null,
    },
    {
      enabled: !isOpen && !isEdit,
    },
  );
  const searchedTemplateList = useGetFunctionTemplatesQuery(
    {
      page: 1,
      pageSize: 3,
      keyword: localStorage.getItem("templateId") || "",
      type: "default",
      asc: 1,
      sort: null,
    },
    {
      enabled: !!localStorage.getItem("templateId") && !isEdit,
    },
  );

  const recommendedList = useMemo(
    () => InitialTemplateList.data?.data.list || [],
    [InitialTemplateList],
  );
  const searchedList = useMemo(
    () => searchedTemplateList.data?.data.list || [],
    [searchedTemplateList],
  );
  const showedList = useMemo(() => {
    return [...searchedList, ...recommendedList].slice(0, 3);
  }, [searchedList, recommendedList]);

  const onSubmit = async (data: any) => {
    let res: any = {};
    if (isEdit && functionItem.name !== data.name) {
      res = await updateFunctionMutation.mutateAsync({
        ...data,
        name: functionItem.name,
        newName: data.name,
      });
      setRecentFunctionList(
        recentFunctionList.map((item: any) => {
          if (item.name === functionItem.name) {
            return { ...item, name: data.name };
          }
          return item;
        }),
      );
      setCurrentFunction({ ...currentFunction, name: data.name });
    } else if (isEdit && functionItem.name === data.name) {
      res = await updateFunctionMutation.mutateAsync(data);
      setCurrentFunction({ ...currentFunction, ...data });
    } else {
      res = await createFunctionMutation.mutateAsync(data);
    }

    if (!res.error) {
      showSuccess(isEdit ? t("update success") : t("create success"));
      onClose();
      reset(defaultValues);
      navigate(`/app/${currentApp.appid}/function/${res.data.name}`, { replace: true });
      hideContextMenu && hideContextMenu();
    }
  };

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            onOpen();
            reset(defaultValues);
            setSearchKey("");
            setTimeout(() => {
              setFocus("name");
            }, 0);
          },
        })}

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent m="auto" className="!pb-12">
          <ModalHeader>
            {isEdit ? t("FunctionPanel.EditFunction") : t("FunctionPanel.AddFunction")}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody className="mb-4 !px-16">
            <VStack align="flex-start">
              <FormControl isInvalid={!!errors?.name}>
                <div className="my-3 flex h-12 w-full items-center border-b-2">
                  <input
                    {...register("name", {
                      pattern: {
                        value: /^[a-zA-Z0-9_.\-](?:[a-zA-Z0-9_.\-/]{0,254}[a-zA-Z0-9_.\-])?$/,
                        message: t("FunctionPanel.FunctionNameRule"),
                      },
                    })}
                    id="name"
                    placeholder={String(t("FunctionPanel.FunctionNameTip"))}
                    className="h-8 w-full border-l-2 border-primary-600 bg-transparent pl-4 text-2xl font-medium"
                    style={{ outline: "none", boxShadow: "none" }}
                    onChange={(e) => {
                      setSearchKey(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onSubmit({ ...getValues(), name: searchKey });
                      }
                    }}
                  />
                </div>
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors?.methods}>
                <HStack spacing={6} className="mt-2">
                  <Controller
                    name="methods"
                    control={control}
                    render={({ field: { ref, ...rest } }) => (
                      <CheckboxGroup {...rest} colorScheme="primary">
                        {Object.keys(SUPPORTED_METHODS).map((item) => {
                          return (
                            <Checkbox value={item} key={item}>
                              {item}
                            </Checkbox>
                          );
                        })}
                      </CheckboxGroup>
                    )}
                  />
                </HStack>
                <FormErrorMessage>{errors.methods?.message}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <HStack className="mt-1 w-full">
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <InputTag value={value || []} onChange={onChange} tagList={tagList} />
                    )}
                  />
                </HStack>
              </FormControl>
              <FormControl>
                <div className="mb-2 flex w-full items-center border-b-2 border-transparent pb-1 focus-within:border-grayModern-200">
                  <TextIcon fontSize={16} color={"gray.300"} />
                  <input
                    id="description"
                    placeholder={t("FunctionPanel.Description").toString()}
                    className="w-full bg-transparent pl-2 text-lg text-second"
                    style={{ outline: "none", boxShadow: "none" }}
                    {...register("description")}
                  />
                </div>
              </FormControl>
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                isLoading={updateFunctionMutation.isLoading || createFunctionMutation.isLoading}
                className="!h-9 w-full !rounded !bg-primary-600 !font-semibold hover:!bg-primary-700"
              >
                {!isEdit ? t("CreateFunction") : t("EditFunction")}
              </Button>
            </VStack>
          </ModalBody>
          {!isEdit && !aiCode && (
            <>
              <Divider />
              <ModalFooter className="!px-16">
                <div className="mt-2 w-full">
                  <div className="pb-3 text-lg font-medium text-grayModern-700">
                    {t("Template.Recommended")}
                  </div>
                  <div className="mb-11 flex w-full">
                    {showedList.map((item: TFunctionTemplate) => (
                      <section
                        className="h-28 w-1/3 px-1.5 py-1"
                        key={item._id}
                        onClick={() => {
                          setTemplateOpen(true);
                        }}
                      >
                        <TemplateCard template={item} isModal={true} />
                      </section>
                    ))}
                  </div>
                  <div>
                    <button
                      className="flex w-full cursor-pointer items-center justify-center bg-primary-100 py-2 text-primary-600"
                      onClick={() => {
                        setTemplateOpen(true);
                        setShowTemplateItem(false);
                      }}
                    >
                      <MoreTemplateIcon className="mr-2 text-lg" />
                      {t("FunctionPanel.CreateFromTemplate")}
                    </button>
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={templateOpen}
        onClose={() => {
          setTemplateOpen(!templateOpen);
          navigate(`/app/${currentApp.appid}/function`, { replace: true });
        }}
      >
        <ModalOverlay />
        <ModalContent height={"95%"} maxW={"80%"} m={"auto"}>
          <ModalHeader pb={-0.5}>{t("HomePage.NavBar.funcTemplate")}</ModalHeader>
          <ModalBody
            overflowY={"auto"}
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            <ModalCloseButton />
            <FunctionTemplate isModal={true} />
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateModal;
