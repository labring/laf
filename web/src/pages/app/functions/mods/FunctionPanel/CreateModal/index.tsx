import { Controller, useForm } from "react-hook-form";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
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
import { t } from "i18next";

import IconWrap from "@/components/IconWrap";

import { useCreateFuncitonMutation, useUpdateFunctionMutation } from "../../../service";
import useFunctionStore from "../../../store";

import defaultString from "./defaultFunctionString";

import useGlobalStore from "@/pages/globalStore";

const CreateModal = (props: { functionItem?: any }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const store = useFunctionStore();

  const { showSuccess } = useGlobalStore();

  const { functionItem } = props;
  const isEdit = !!functionItem;

  const defaultValues = {
    name: functionItem?.name || "",
    description: functionItem?.desc || "",
    websocket: !!functionItem?.websocket,
    methods: functionItem?.methods || ["HEAD"],
    code: functionItem?.source.code || defaultString,
  };

  type FormData = {
    name: string;
    description: string;
    websocket: boolean;
    methods: string[];
    code: string;
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

  const createFuncitonMutation = useCreateFuncitonMutation();
  const updateFunctionMutation = useUpdateFunctionMutation();

  const onSubmit = async (data: any) => {
    let res: any = {};
    if (isEdit) {
      res = await updateFunctionMutation.mutateAsync(data);
      store.setCurrentFunction(res.data);
    } else {
      res = await createFuncitonMutation.mutateAsync(data);
      store.setCurrentFunction(res.data);
    }

    if (!res.error) {
      showSuccess(isEdit ? "update success" : "create success");
      onClose();
      reset(defaultValues);
    }
  };

  return (
    <>
      <IconWrap
        size={20}
        tooltip={isEdit ? "编辑函数" : "添加函数"}
        onClick={() => {
          onOpen();
          reset(defaultValues);
          setTimeout(() => {
            setFocus("name");
          }, 0);
        }}
      >
        {isEdit ? <EditIcon /> : <AddIcon fontSize={10} />}
      </IconWrap>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? "编辑函数" : "添加函数"}</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isInvalid={!!errors?.name}>
                <FormLabel htmlFor="name">函数名</FormLabel>
                <Input
                  {...register("name", {
                    required: "name is required",
                  })}
                  id="name"
                  placeholder="函数唯一标识, 如 get-user "
                  disabled={isEdit}
                  variant="filled"
                />
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors?.description}>
                <FormLabel htmlFor="description">显示名称</FormLabel>
                <Input
                  {...register("description", {
                    required: "description is required",
                  })}
                  id="description"
                  placeholder="函数显示名, 可为中文"
                  variant="filled"
                />
                <FormErrorMessage>
                  {errors.description && errors.description.message}
                </FormErrorMessage>{" "}
              </FormControl>

              <FormControl isInvalid={!!errors?.websocket}>
                <FormLabel htmlFor="websocket">是否支持 websocket</FormLabel>
                <Switch {...register("websocket")} id="websocket" variant="filled" />
                <FormErrorMessage>
                  {errors.websocket && errors.websocket.message}
                </FormErrorMessage>{" "}
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
};

export default CreateModal;
