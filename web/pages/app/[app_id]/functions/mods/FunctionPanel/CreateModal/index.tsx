import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AddIcon } from "@chakra-ui/icons";
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
  Switch,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";
import useGlobalStore from "pages/globalStore";

import IconWrap from "@/components/IconWrap";

import useFunctionStore, { TFunction } from "../../../store";

const CreateModal = forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const formRef = React.useRef(null);

  const { showSuccess } = useGlobalStore();
  const { createFunction } = useFunctionStore();
  const [currentFunc, setCurrentFunc] = useState<TFunction | any>();
  const [isEdit, setIsEdit] = useState(false);

  type FormData = {
    name: string;
    description: string;
    websocket: boolean;
    methods: string[];
    codes: string;
  };

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      websocket: false,
      methods: ["HEAD"],
      codes: "console.log(123)",
    },
  });

  const onSubmit = async (data: any) => {
    const res = await createFunction(data);
    if (!res.error) {
      showSuccess("create success.");
      onClose();
      reset();
    }
  };

  const initialRef = React.useRef(null);

  useImperativeHandle(ref, () => {
    return {
      edit: (item: TFunction) => {
        setCurrentFunc(item);
        setIsEdit(true);
        onOpen();
        setFocus("name");
      },
    };
  });

  return (
    <>
      <IconWrap
        size={20}
        onClick={() => {
          setCurrentFunc({});
          setIsEdit(false);
          onOpen();
          setTimeout(() => {
            setFocus("name");
          }, 0);
        }}
      >
        <AddIcon fontSize={10} />
      </IconWrap>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>添加函数</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isInvalid={!!errors?.name}>
                <FormLabel htmlFor="name">函数名称</FormLabel>
                <Input
                  {...register("name", {
                    required: "name is required",
                  })}
                  id="name"
                  variant="filled"
                />
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>{" "}
              </FormControl>

              <FormControl isInvalid={!!errors?.description}>
                <FormLabel htmlFor="description">函数描述</FormLabel>
                <Input
                  {...register("description", {
                    required: "description is required",
                  })}
                  id="description"
                  variant="filled"
                  readOnly={isEdit}
                />
                <FormErrorMessage>
                  {errors.description && errors.description.message}
                </FormErrorMessage>{" "}
              </FormControl>

              <FormControl isInvalid={!!errors?.websocket}>
                <FormLabel htmlFor="websocket">是否支持 websocket</FormLabel>
                <Switch
                  {...register("websocket")}
                  id="websocket"
                  variant="filled"
                  readOnly={isEdit}
                />
                <FormErrorMessage>{errors.websocket && errors.websocket.message}</FormErrorMessage>{" "}
              </FormControl>

              <FormControl isInvalid={!!errors?.methods}>
                <FormLabel htmlFor="methods">请求方法</FormLabel>
                <HStack spacing={6}>
                  <Controller
                    name="methods"
                    control={control}
                    render={({ field: { ref, ...rest } }) => (
                      <CheckboxGroup {...rest}>
                        <Checkbox value="HEAD">HEAD</Checkbox>
                        <Checkbox value="GET">GET</Checkbox>
                        <Checkbox value="POST">POST</Checkbox>
                      </CheckboxGroup>
                    )}
                    rules={{
                      required: { value: true, message: "Please select at least one" },
                    }}
                  />
                </HStack>
                <FormErrorMessage>{errors.methods?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="primary" mr={3} type="submit" onClick={handleSubmit(onSubmit)}>
              {t`Confirm`}
            </Button>
            <Button
              onClick={() => {
                onClose();
              }}
            >{t`Cancel`}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

CreateModal.displayName = "CreateModal";

export default CreateModal;
