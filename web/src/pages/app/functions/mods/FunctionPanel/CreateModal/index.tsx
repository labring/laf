import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  CheckboxGroup,
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
import clsx from "clsx";
import { t } from "i18next";
import { debounce } from "lodash";

import { TextIcon } from "@/components/CommonIcon";
import InputTag from "@/components/InputTag";
import { SUPPORTED_METHODS } from "@/constants";
import { changeURL } from "@/utils/format";

import { useCreateFunctionMutation, useUpdateFunctionMutation } from "../../../service";
import useFunctionStore from "../../../store";
import FuncTemplate from "../FunctionTemplate";

import functionTemplates from "./functionTemplates";

import { TFunctionTemplate, TMethod } from "@/apis/typing";
import TemplatePopOver from "@/pages/functionTemplate/Mods/TemplatePopover/TemplatePopover";
import { useGetRecommendFunctionTemplatesQuery } from "@/pages/functionTemplate/service";
import useGlobalStore from "@/pages/globalStore";

const CreateModal = (props: {
  functionItem?: any;
  children?: React.ReactElement;
  tagList?: any;
  aiCode?: string;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const store = useFunctionStore();
  const { showSuccess, currentApp } = useGlobalStore();

  const { functionItem, children = null, tagList, aiCode } = props;
  const isEdit = !!functionItem;
  const navigate = useNavigate();
  const [searchKey, setSearchKey] = useState("");

  const defaultValues = {
    name: functionItem?.name || "",
    description: functionItem?.desc || "",
    websocket: !!functionItem?.websocket,
    methods: functionItem?.methods || ["GET", "POST"],
    code: functionItem?.source.code || aiCode || functionTemplates[0].value.trim() || "",
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
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

  const createFunctionMutation = useCreateFunctionMutation();
  const updateFunctionMutation = useUpdateFunctionMutation();

  const TemplateList = useGetRecommendFunctionTemplatesQuery(
    {
      page: 1,
      pageSize: 6,
      keyword: searchKey,
      type: "default",
      asc: 1,
      sort: null,
    },
    {
      enabled: isOpen && !isEdit,
    },
  );

  const onSubmit = async (data: any) => {
    let res: any = {};
    if (isEdit && functionItem.name !== data.name) {
      res = await updateFunctionMutation.mutateAsync({
        ...data,
        name: functionItem.name,
        newName: data.name,
      });
    } else if (isEdit && functionItem.name === data.name) {
      res = await updateFunctionMutation.mutateAsync(data);
    } else {
      res = await createFunctionMutation.mutateAsync(data);
    }

    if (!res.error) {
      showSuccess(isEdit ? t("update success") : t("create success"));
      onClose();
      store.setCurrentFunction(res.data);
      reset(defaultValues);
      navigate(`/app/${currentApp.appid}/function/${res.data.name}`);
    }
  };

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            onOpen();
            reset(defaultValues);
            setTimeout(() => {
              setFocus("name");
            }, 0);
          },
        })}

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEdit ? t("FunctionPanel.EditFunction") : t("FunctionPanel.AddFunction")}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack align="flex-start">
              <FormControl isInvalid={!!errors?.name}>
                <div className="mb-3 flex h-12 w-full items-center border-b-2">
                  <input
                    {...register("name", {
                      pattern: {
                        value: /^[a-zA-Z0-9_.\-/]{1,256}$/,
                        message: t("FunctionPanel.FunctionNameRule"),
                      },
                    })}
                    id="name"
                    placeholder={String(t("FunctionPanel.FunctionNameTip"))}
                    className="h-8 w-full border-l-2 border-primary-600 bg-transparent pl-4 text-2xl font-medium"
                    style={{ outline: "none", boxShadow: "none" }}
                    onChange={debounce((e) => {
                      setSearchKey(e.target.value);
                    }, 500)}
                  />
                </div>
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors?.methods}>
                <HStack spacing={6}>
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
                <div className="flex w-full items-center border-b-2 border-transparent focus-within:border-grayModern-200">
                  <TextIcon fontSize={16} color={"gray.300"} />
                  <input
                    id="description"
                    placeholder={t("FunctionPanel.Description").toString()}
                    className="w-full bg-transparent py-2 pl-2 text-lg text-second"
                    style={{ outline: "none", boxShadow: "none" }}
                    {...register("description")}
                  />
                </div>
              </FormControl>

              {!isEdit && !aiCode && (
                <div className="w-full">
                  {TemplateList.data?.data.list.length > 0 && (
                    <div className="pb-3 text-lg font-medium text-grayModern-700">
                      {t("Template.Recommended")}
                    </div>
                  )}
                  <div className="flex flex-wrap">
                    {TemplateList.data?.data.list.map((item: TFunctionTemplate) => (
                      <div className="mb-3 w-1/3 pr-3" key={item._id}>
                        <TemplatePopOver template={item}>
                          <div
                            onClick={() => {
                              const currentURL = window.location.pathname;
                              const lastIndex = currentURL.lastIndexOf("/");
                              const newURL = currentURL.substring(0, lastIndex) + `/${item._id}`;
                              navigate(newURL);
                            }}
                          >
                            <FuncTemplate>
                              <div
                                className="cursor-pointer rounded-lg border-[1px] px-5"
                                style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.outlineWidth = "2px";
                                  e.currentTarget.style.boxShadow =
                                    "0px 2px 4px rgba(0, 0, 0, 0.1), 0px 0px 0px 2px #66CBCA";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.outlineWidth = "1px";
                                  e.currentTarget.style.boxShadow =
                                    "0px 2px 4px rgba(0, 0, 0, 0.1)";
                                }}
                              >
                                <div className={clsx("mb-3 flex justify-between pt-4")}>
                                  <div className="flex items-center text-xl font-semibold">
                                    <span className="line-clamp-1">{item.name}</span>
                                  </div>
                                </div>
                                <div className="mb-3 flex h-4 items-center truncate">
                                  {item.description}
                                </div>
                                <div className="flex w-full overflow-hidden pb-4">
                                  {item.items.map((item: any) => {
                                    return (
                                      <div
                                        key={item.name}
                                        className="mr-2 whitespace-nowrap rounded-md bg-blue-100 px-2 py-1 text-center font-medium text-blue-700"
                                      >
                                        {item.name}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </FuncTemplate>
                          </div>
                        </TemplatePopOver>
                      </div>
                    ))}
                  </div>
                  <div
                    onClick={() => {
                      navigate(changeURL(`/recommended`));
                    }}
                  >
                    <FuncTemplate>
                      <button className="w-full cursor-pointer bg-primary-100 py-2 text-primary-600">
                        {t("FunctionPanel.CreateFromTemplate")}
                      </button>
                    </FuncTemplate>
                  </div>
                </div>
              )}

              {/* <FormControl isInvalid={!!errors?.websocket} hidden>
                <FormLabel htmlFor="websocket">{t("FunctionPanel.isSupport")} websocket</FormLabel>
                <Switch {...register("websocket")} id="websocket" variant="filled" />
                <FormErrorMessage>
                  {errors.websocket && errors.websocket.message}
                </FormErrorMessage>{" "}
              </FormControl> */}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                onClose();
              }}
            >{t`Cancel`}</Button>
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              isLoading={updateFunctionMutation.isLoading || createFunctionMutation.isLoading}
            >
              {t`Confirm`}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateModal;
