import React from "react";
import { Controller, useForm } from "react-hook-form";
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

import { TextIcon } from "@/components/CommonIcon";
import InputTag from "@/components/InputTag";
import { SUPPORTED_METHODS } from "@/constants";

import { useCreateFunctionMutation, useUpdateFunctionMutation } from "../../../service";
import useFunctionStore from "../../../store";
import FunctionTemplate from "../FunctionTemplate";

import functionTemplates from "./functionTemplates";

import { TMethod } from "@/apis/typing";
import useGlobalStore from "@/pages/globalStore";

const CreateModal = (props: {
  functionItem?: any;
  children?: React.ReactElement;
  tagList?: any;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const store = useFunctionStore();
  const { showSuccess } = useGlobalStore();

  const { functionItem, children = null, tagList } = props;
  const isEdit = !!functionItem;

  const defaultValues = {
    name: functionItem?.name || "",
    description: functionItem?.desc || "",
    websocket: !!functionItem?.websocket,
    methods: functionItem?.methods || ["GET", "POST"],
    code: functionItem?.source.code || functionTemplates[0].value.trim(),
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

  const onSubmit = async (data: any) => {
    let res: any = {};
    if (isEdit) {
      res = await updateFunctionMutation.mutateAsync(data);
    } else {
      res = await createFunctionMutation.mutateAsync(data);
    }

    if (!res.error) {
      showSuccess(isEdit ? t("update success") : t("create success"));
      onClose();
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

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEdit ? t("FunctionPanel.EditFunction") : t("FunctionPanel.AddFunction")}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack align="flex-start">
              <FormControl isInvalid={!!errors?.name}>
                <div
                  className={clsx(
                    "mb-3 flex h-12 w-full items-center border-b-2",
                    isEdit ? "rounded-md bg-gray-100" : "",
                  )}
                >
                  <input
                    {...register("name", {
                      pattern: {
                        value: /^[a-zA-Z0-9_.\-/]{1,256}$/,
                        message: t("FunctionPanel.FunctionNameRule"),
                      },
                    })}
                    id="name"
                    placeholder={String(t("FunctionPanel.FunctionNameTip"))}
                    disabled={isEdit}
                    className="h-8 w-10/12 border-l-2 border-primary-600 bg-transparent pl-4 text-2xl font-medium"
                    style={{ outline: "none", boxShadow: "none" }}
                  />
                  {isEdit ? null : (
                    <FunctionTemplate>
                      <span className="w-2/12 cursor-pointer pl-2 text-lg font-medium text-primary-600">
                        {t("FunctionPanel.CreateFromTemplate")}
                      </span>
                    </FunctionTemplate>
                  )}
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
                <div className="flex w-full items-center focus-within:border-b-2">
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
