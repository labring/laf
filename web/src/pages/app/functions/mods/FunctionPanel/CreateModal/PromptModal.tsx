import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Switch,
  Textarea,
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import FunctionEditor from "@/components/Editor/FunctionEditor";
import InputTag from "@/components/InputTag";
import { SUPPORTED_METHODS } from "@/constants";
import request from "@/utils/request";

import { useCreateFunctionMutation, useUpdateFunctionMutation } from "../../../service";
import useFunctionStore from "../../../store";

import { TMethod } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

const PromptModal = (props: { functionItem?: any; children?: React.ReactElement }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const store = useFunctionStore();
  const { showSuccess } = useGlobalStore();
  const { t } = useTranslation();

  const { functionItem, children = null } = props;
  const isEdit = !!functionItem;

  const CancelToken = axios.CancelToken;
  let source = CancelToken.source();
  const { colorMode } = useColorMode();

  const { data: generateCodeRes, ...generateCode } = useMutation((params: any) => {
    return request("https://zbkzzm.laf.dev/prompt-functions", {
      method: "POST",
      data: params,
      cancelToken: source.token,
    });
  });

  let _aiGenerateCode = ((generateCodeRes as any)?.sources || [])[0]?.code;

  const defaultValues = {
    name: functionItem?.name || "",
    description: functionItem?.desc || "",
    websocket: !!functionItem?.websocket,
    methods: functionItem?.methods || ["GET", "POST"],
    code: "",
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
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

  const createFunctionMutation = useCreateFunctionMutation();
  const updateFunctionMutation = useUpdateFunctionMutation();

  const onSubmit = async (data: any) => {
    let res: any = {};
    if (isEdit) {
      res = await updateFunctionMutation.mutateAsync({
        ...data,
        code: _aiGenerateCode,
      });
    } else {
      res = await createFunctionMutation.mutateAsync({
        ...data,
        code: _aiGenerateCode,
      });
    }

    if (!res.error) {
      showSuccess(isEdit ? "update success" : "create success");
      onClose();
      generateCode.reset();
      store.setCurrentFunction(res.data);
      reset(defaultValues);
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

      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEdit ? t("FunctionPanel.EditFunction") : t("FunctionPanel.AddFunction")}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isInvalid={!!errors?.name}>
                <FormLabel htmlFor="name">{t("FunctionPanel.FunctionName")}</FormLabel>
                <Input
                  {...register("name", {
                    pattern: {
                      value: /^[_A-Za-z][A-Za-z0-9-_]+$/,
                      message: t("FunctionPanel.FunctionNameRule"),
                    },
                  })}
                  id="name"
                  placeholder={String(t("FunctionPanel.FunctionNameTip"))}
                  disabled={isEdit}
                  variant="filled"
                />
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors?.tags} hidden>
                <FormLabel htmlFor="tags">{t("FunctionPanel.Tags")}</FormLabel>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <InputTag value={value} onChange={onChange} />
                  )}
                />
                <FormErrorMessage>{errors.tags && errors.tags.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors?.methods} hidden>
                <FormLabel htmlFor="methods">{t("FunctionPanel.Methods")}</FormLabel>
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
                <FormLabel htmlFor="description">{t("FunctionPanel.Description")}</FormLabel>
                <Textarea
                  rows={6}
                  {...register("description")}
                  id="description"
                  placeholder={t("FunctionPanel.PromptDescription").toString()}
                  variant="filled"
                />
              </FormControl>

              <div className="flex w-full items-center justify-center">
                <Button
                  disabled={generateCode.isLoading}
                  isLoading={generateCode.isLoading}
                  onClick={async () => {
                    generateCode.reset();
                    await generateCode.mutateAsync({
                      purpose: getValues("description"),
                    });
                  }}
                >
                  {generateCode.isLoading ? t("Generating") : t("Start")}
                </Button>
                <span className="ml-2 text-red-600">
                  {typeof generateCodeRes === "string" ? generateCodeRes : null}
                </span>
                {generateCode.isLoading ? (
                  <a
                    href="/cancel_generate"
                    className="ml-2 text-blue-600"
                    onClick={(event) => {
                      event?.preventDefault();
                      source.cancel();
                      generateCode.reset();
                    }}
                  >
                    {t("Cancel")}
                  </a>
                ) : null}
              </div>
              {generateCode.isLoading ? (
                <div className="w-full py-4">
                  <Progress size="xs" isIndeterminate />
                </div>
              ) : null}
              {_aiGenerateCode && (
                <FunctionEditor
                  className="w-full"
                  height="300px"
                  value={_aiGenerateCode}
                  readOnly={true}
                  colorMode={colorMode}
                  path={Math.random().toString()}
                />
              )}
              <FormControl isInvalid={!!errors?.websocket} hidden>
                <FormLabel htmlFor="websocket">{t("FunctionPanel.isSupport")} websocket</FormLabel>
                <Switch {...register("websocket")} id="websocket" variant="filled" />
                <FormErrorMessage>
                  {errors.websocket && errors.websocket.message}
                </FormErrorMessage>{" "}
              </FormControl>
            </VStack>
          </ModalBody>

          {_aiGenerateCode ? (
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
          ) : null}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PromptModal;
