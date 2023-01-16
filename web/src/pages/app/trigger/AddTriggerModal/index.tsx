import React from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
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

import { useCreateTriggerMutation } from "../service";
import {} from "../service";

import { useFunctionListQuery } from "@/pages/app/functions/service";

const AddTriggerModal = (props: { children: React.ReactElement; targetFunc?: string }) => {
  type FormData = {
    desc: string;
    target: string;
    cron: string;
  };
  const {
    register,
    handleSubmit,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const { targetFunc, children } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const functionListQuery = useFunctionListQuery({ onSuccess: (data: any) => {} });
  const addTriggerMutation = useCreateTriggerMutation(() => {
    onClose();
  });
  const onSubmit = (data: any) => {
    addTriggerMutation.mutate(data);
    onClose();
  };
  const initFormData = () => {
    reset({
      desc: "",
      target: targetFunc ? targetFunc : functionListQuery?.data?.data[0]?.name,
      cron: "",
    });
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          onOpen();
          initFormData();
          setTimeout(() => setFocus("desc"), 0);
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>添加触发器</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isInvalid={!!errors?.desc}>
                <FormLabel htmlFor="desc">触发器名称</FormLabel>
                <Input
                  {...register("desc", {
                    required: "desc is required",
                  })}
                  id="desc"
                  variant="filled"
                  placeholder="请输入触发器名称"
                />
                <FormErrorMessage>{errors.desc && errors.desc.message}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="target">关联函数</FormLabel>
                <Select
                  {...register("target", {
                    required: "target is required",
                  })}
                  id="target"
                  disabled={!!targetFunc}
                  variant="filled"
                  placeholder="请选择关联的云函数"
                >
                  {(functionListQuery?.data?.data || []).map((item: any) => {
                    return (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="name">类型</FormLabel>
                <Input value="定时任务" variant="filled" readOnly />
              </FormControl>
              <FormControl isInvalid={!!errors?.cron}>
                <FormLabel htmlFor="cron">Cron表达式</FormLabel>
                <Input
                  {...register("cron", {
                    required: "cron is required",
                  })}
                  id="desc"
                  variant="filled"
                  placeholder="例:0/1 * * * * ？表示每 1 秒执行任务"
                />
                <FormErrorMessage>{errors.cron && errors.cron.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={addTriggerMutation.isLoading}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              新建
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

AddTriggerModal.displayName = "AddTriggerModal";

export default AddTriggerModal;
