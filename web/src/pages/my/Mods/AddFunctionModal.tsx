import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { TextIcon } from "@/components/CommonIcon";
import InputTag from "@/components/InputTag";
import { SUPPORTED_METHODS } from "@/constants";

const AddFunctionModal = (props: {
  children?: React.ReactElement;
  functionList?: any[];
  setFunctionList?: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentFunction?: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const { children = null, functionList, setFunctionList, setCurrentFunction } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const defaultValues = {
    name: "",
    methods: ["GET"],
    tags: [],
    description: "",
  };
  const {
    handleSubmit,
    register,
    reset,
    setFocus,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    if (setFunctionList && setCurrentFunction) {
      setFunctionList([...(functionList || []), { ...data, code: "" }]);
      setCurrentFunction({ ...data, code: "" });
      onClose();
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
          <ModalHeader>{t("FunctionPanel.AddFunction")}</ModalHeader>
          <ModalCloseButton />

          <ModalBody className="">
            <div className="mb-3 flex h-12 w-full items-center border-b-2">
              <input
                {...register("name", {
                  required: true,
                  pattern: {
                    value: /^[a-zA-Z0-9_.\-/]{1,256}$/,
                    message: t("FunctionPanel.FunctionNameRule"),
                  },
                })}
                id="name"
                placeholder={String(t("FunctionPanel.FunctionNameTip"))}
                className="h-8 w-10/12 border-l-2 border-primary-600 bg-transparent pl-4 text-2xl font-medium"
                style={{ outline: "none", boxShadow: "none" }}
              />
            </div>
            {errors.name && (
              <span className="text-red-500">{t("FunctionPanel.FunctionNameRule")}</span>
            )}
            <HStack spacing={6} className="mb-3">
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
            <HStack className="mb-1 w-full">
              <Controller
                name="tags"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <InputTag value={value || []} onChange={onChange} tagList={[]} />
                )}
              />
            </HStack>
            <div className={clsx("flex w-full items-center focus-within:border-b-2")}>
              <TextIcon fontSize={18} color={"#D9D9D9"} />
              <input
                id="description"
                placeholder={t("FunctionPanel.Description").toString()}
                className="w-full bg-transparent py-2 pl-2 text-lg text-second"
                style={{ outline: "none", boxShadow: "none" }}
                {...register("description")}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit(onSubmit)}>{t("Confirm")}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddFunctionModal;
