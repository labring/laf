import React from "react";
import { Controller, useForm } from "react-hook-form";
import { CheckIcon } from "@chakra-ui/icons";
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
  Select,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";

import { APP_STATUS, DEFAULT_REGION } from "@/constants/index";

import { ApplicationControllerCreate, ApplicationControllerUpdate } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";

const CreateAppModal = (props: { application?: any; children: React.ReactElement }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const queryClient = useQueryClient();

  const { application = {} } = props;
  const isEdit = !!application.name;

  const { bundles = [], runtimes = [], regions = [] } = useGlobalStore();

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

  const appCreateMutaion = useMutation((params: any) => ApplicationControllerCreate(params));

  const updateAppMutation = useMutation((params: any) => ApplicationControllerUpdate(params));

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
      {React.cloneElement(props.children, {
        onClick: (event?: any) => {
          event?.preventDefault();
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
          <ModalHeader>{isEdit ? "编辑应用" : "新建应用"}</ModalHeader>
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
                <FormLabel htmlFor="region">可用区</FormLabel>
                <HStack spacing={6}>
                  <Controller
                    name="region"
                    control={control}
                    render={({ field: { ref, ...rest } }) => {
                      return (
                        <div>
                          {regions.map((region: any) => {
                            return (
                              <div className="flex items-center">
                                <Button
                                  variant={"ghost"}
                                  size="sm"
                                  colorScheme={rest.value === region.name ? "green" : "gray"}
                                  key={region.name}
                                >
                                  <CheckIcon className="mr-2" />
                                  {region.name}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                    rules={{
                      required: { value: true, message: "Please select at least one" },
                    }}
                  />
                </HStack>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors?.bundleName}>
                <FormLabel htmlFor="bundleName">应用规格</FormLabel>
                <Select
                  {...register("bundleName", {
                    required: "bundleName is required",
                  })}
                  disabled={isEdit}
                >
                  {(bundles || []).map((bundle: any) => {
                    return (
                      <option value={bundle.name} key={bundle.name}>
                        {bundle.displayName}
                      </option>
                    );
                  })}
                </Select>
                <FormErrorMessage>{errors?.bundleName?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors?.runtimeName}>
                <FormLabel htmlFor="runtimeName">运行时</FormLabel>
                <Select
                  {...register("runtimeName", {
                    required: "runtimeName is required",
                  })}
                  disabled={isEdit}
                >
                  {(runtimes || []).map((runtime: any) => {
                    return (
                      <option value={runtime.name} key={runtime.name}>
                        {runtime.name} - {runtime.version}
                      </option>
                    );
                  })}
                </Select>
                <FormErrorMessage>{errors?.runtimeName?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              isLoading={appCreateMutaion.isLoading}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              {t("Common.Dialog.AppCreate")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

CreateAppModal.displayName = "CreateModal";

export default CreateAppModal;
