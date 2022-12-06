import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AddIcon } from "@chakra-ui/icons";
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
import { t } from "@lingui/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useGlobalStore from "pages/globalStore";
import { ApplicationsControllerCreate } from "services/v1/applications";

import { APP_STATUS } from "@/constants/index";

const CreateAppModal = forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const [isEdit, setIsEdit] = useState(false);

  type FormData = {
    displayName: string;
    bundleName: string;
    runtimeName: string;
    region: string;
    state: APP_STATUS;
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
      region: "default",
      bundleName: "mini",
      state: APP_STATUS.Running,
      runtimeName: "node-laf",
    },
  });

  const { showSuccess, showError } = useGlobalStore();

  const appCreateMutaion = useMutation((params: any) => ApplicationsControllerCreate(params), {
    onSuccess: (data) => {
      if (!data.error) {
        onClose();
        setTimeout(() => {
          showSuccess("添加成功");
        }, 100);
        queryClient.invalidateQueries(["appListQuery"]);
      } else {
        showError(data.error);
      }
    },
  });

  useImperativeHandle(ref, () => {
    return {
      edit: (item: any) => {
        setIsEdit(true);
        reset({
          ...item,
          displayName: item.name,
          region: item.regionName,
        });
        onOpen();
        setTimeout(() => {
          setFocus("displayName");
        }, 0);
      },
    };
  });

  const onSubmit = async (data: any) => {
    appCreateMutaion.mutate(data);
  };

  return (
    <>
      <Button
        size={"lg"}
        colorScheme="primary"
        style={{ padding: "0 40px" }}
        leftIcon={<AddIcon />}
        onClick={() => {
          setIsEdit(false);
          reset();
          onOpen();

          setTimeout(() => {
            setFocus("displayName");
          }, 0);
        }}
      >
        {t`NewApplication`}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>新建应用</ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isRequired isInvalid={!!errors?.displayName}>
                <FormLabel htmlFor="displayName">应用名称</FormLabel>
                <Input
                  {...register("displayName", {
                    required: "displayName is required",
                  })}
                />
                <FormErrorMessage>
                  {errors?.displayName && errors?.displayName?.message}
                </FormErrorMessage>
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

CreateAppModal.displayName = "CreateModal";

export default CreateAppModal;
