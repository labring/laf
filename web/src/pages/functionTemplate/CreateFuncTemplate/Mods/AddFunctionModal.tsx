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
import { SUPPORTED_METHODS } from "@/constants";

import useGlobalStore from "@/pages/globalStore";

const AddFunctionModal = (props: {
  children?: React.ReactElement;
  functionList?: any[];
  setFunctionList?: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentFunction?: React.Dispatch<React.SetStateAction<any>>;
  currentFunction?: any;
}) => {
  const {
    children = null,
    functionList,
    setFunctionList,
    setCurrentFunction,
    currentFunction,
  } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { showError } = useGlobalStore();
  const defaultValues = {
    name: "",
    methods: ["GET", "POST"],
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
    if (functionList?.some((item) => item.name === data.name)) {
      showError(t("Template.FunctionNameExist"));
    } else if (setFunctionList && setCurrentFunction) {
      setFunctionList([...(functionList || []), { ...data, source: { code: "" } }]);
      setCurrentFunction({ ...data, source: { code: "" } });
      console.log("AddFunctionModal", currentFunction);
      onClose();
    }
  };

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            if (functionList && setCurrentFunction) {
              setCurrentFunction(
                functionList.find((item) => item.name === currentFunction?.name) || null,
              );
            }
            console.log(currentFunction);
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
            <div
              className={clsx(
                "flex w-full items-center border-b-2 border-transparent focus-within:border-grayModern-200",
              )}
            >
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
