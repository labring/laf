import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
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
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { APP_STATUS, DEFAULT_REGION } from "@/constants/index";

import { ApplicationsControllerCreate, ApplicationsControllerUpdate } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";

const CreateAppModal = (props: { application?: any; children: React.ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const { application = {} } = props;
  const isEdit = !!application.name;

  const { bundles = [], runtimes = [] } = useGlobalStore();

  type FormData = {
    name: string;
    state: APP_STATUS;
    region: string;
    bundleName: string;
    runtimeName: string;
  };

  const defaultValues = {
    name: application.name,
    state: application.state || APP_STATUS.Running,
    region: application.regionName || DEFAULT_REGION,
    bundleName: bundles[0].name,
    runtimeName: runtimes[0].name,
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

  const { showSuccess, showError } = useGlobalStore();

  const appCreateMutaion = useMutation((params: any) => ApplicationsControllerCreate(params));

  const updateAppMutation = useMutation((params: any) => ApplicationsControllerUpdate(params));

  const onSubmit = async (data: any) => {
    let res: any = {};
    if (isEdit) {
      res = await updateAppMutation.mutateAsync(data);
    } else {
      res = await appCreateMutaion.mutateAsync(data);
    }

    if (!res.error) {
      onClose();
      showSuccess(isEdit ? "update success." : "create success.");
      queryClient.invalidateQueries(["appListQuery"]);
    } else {
      showError(res.error);
    }
  };

  return (
    <>
      {React.cloneElement(props.children as React.ReactElement, {
        onClick: () => {
          reset(defaultValues);
          onOpen();
          setTimeout(() => {
            setFocus("name");
          }, 0);
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新建应用</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isRequired isInvalid={!!errors?.name}>
                <FormLabel htmlFor="name">应用名称</FormLabel>
                <Input
                  {...register("name", {
                    required: "name is required",
                  })}
                />
                <FormErrorMessage>{errors?.name && errors?.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired>
                <FormLabel htmlFor="region">Region</FormLabel>
                <HStack spacing={6}>
                  <Controller
                    name="region"
                    control={control}
                    render={({ field: { ref, ...rest } }) => {
                      return (
                        <Button variant={"solid"} colorScheme="green">
                          {rest?.value}
                        </Button>
                      );
                    }}
                    rules={{
                      required: { value: true, message: "Please select at least one" },
                    }}
                  />
                </HStack>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors?.bundleName}>
                <FormLabel htmlFor="bundleName">Bundle Name</FormLabel>
                <Input
                  {...register("bundleName", {
                    required: "bundleName is required",
                  })}
                  disabled={isEdit}
                />
                <FormErrorMessage>{errors?.bundleName?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors?.runtimeName}>
                <FormLabel htmlFor="runtimeName">Runtime Name</FormLabel>
                <Input
                  {...register("runtimeName", {
                    required: "runtimeName is required",
                  })}
                  disabled={isEdit}
                />
                <FormErrorMessage>{errors?.runtimeName?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="primary"
              mr={3}
              isLoading={appCreateMutaion.isLoading}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              确定
            </Button>
            <Button
              onClick={() => {
                onClose();
              }}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

CreateAppModal.displayName = "CreateModal";

export default CreateAppModal;
