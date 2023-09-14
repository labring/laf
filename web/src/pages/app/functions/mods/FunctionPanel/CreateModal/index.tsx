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
  Select,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "i18next";
import { debounce } from "lodash";

import { TextIcon } from "@/components/CommonIcon";
import InputTag from "@/components/InputTag";
import { SUPPORTED_METHODS } from "@/constants";

import { useCreateFunctionMutation, useUpdateFunctionMutation } from "../../../service";
import useFunctionStore from "../../../store";

import functionTemplates from "./functionTemplates";

import { TMethod } from "@/apis/typing";
import FunctionTemplate from "@/pages/functionTemplate";
import useTemplateStore from "@/pages/functionTemplate/store";
import useGlobalStore from "@/pages/globalStore";

const CreateModal = (props: {
  functionItem?: any;
  children?: React.ReactElement;
  tagList?: any;
  aiCode?: string;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { showSuccess, currentApp } = useGlobalStore();

  const { functionItem, children = null, tagList, aiCode } = props;
  const isEdit = !!functionItem;
  const navigate = useNavigate();
  const [searchKey, setSearchKey] = useState("");
  const [templateOpen, setTemplateOpen] = useState(false);
  const { recentFunctionList, setRecentFunctionList } = useFunctionStore();
  const { setShowTemplateItem } = useTemplateStore();

  const defaultValues = {
    name: functionItem?.name || "",
    description: functionItem?.desc || "",
    websocket: !!functionItem?.websocket,
    methods: functionItem?.methods || ["GET", "POST"],
    code: functionItem?.source?.code || aiCode || functionTemplates[0].value.trim() || "",
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
    } else if (isEdit && functionItem.name === data.name) {
      res = await updateFunctionMutation.mutateAsync(data);
    } else {
      res = await createFunctionMutation.mutateAsync(data);
    }

    if (!res.error) {
      showSuccess(isEdit ? t("update success") : t("create success"));
      onClose();
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
            setSearchKey("");
            setTimeout(() => {
              setFocus("name");
            }, 0);
          },
        })}

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent m="auto" className="!pb-2">
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
                    }, 200)}
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
                <div className="flex w-full items-center border-b-2 border-transparent pb-1 focus-within:border-grayModern-200">
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

              {isEdit || aiCode ? null : (
                <FormControl className="flex">
                  <div className="flex w-20 items-center text-base font-medium">
                    {t("FunctionPanel.Code")}
                  </div>
                  <Select
                    {...register("code")}
                    id="code"
                    placeholder=""
                    variant="filled"
                    className="!h-8 !bg-lafWhite-400"
                  >
                    {functionTemplates.map((item) => {
                      return (
                        <option value={item.value.trim()} key={item.label}>
                          {item.label}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
              )}

              <div className="!mt-4 flex w-full items-center justify-end">
                {!(isEdit || aiCode) && (
                  <Button
                    variant="text"
                    className="mr-2 !h-9 w-32"
                    onClick={() => {
                      setTemplateOpen(true);
                      setShowTemplateItem(false);
                    }}
                    isLoading={createFunctionMutation.isLoading}
                  >
                    {t("FunctionPanel.CreateFromTemplate")}
                  </Button>
                )}
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  isLoading={updateFunctionMutation.isLoading || createFunctionMutation.isLoading}
                  className="!h-9 w-32 !bg-primary-600 !font-semibold hover:!bg-primary-700"
                >
                  {!isEdit ? t("CreateFunction") : t("EditFunction")}
                </Button>
              </div>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={templateOpen}
        onClose={() => {
          setTemplateOpen(!templateOpen);
          navigate(`/app/${currentApp.appid}/function`);
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
