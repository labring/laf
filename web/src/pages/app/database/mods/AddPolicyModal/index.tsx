import { useState } from "react";
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
import { t } from "i18next";

import { useCreatePolicyMutation, useUpdatePolicyMutation } from "../../service";

import { useFunctionListQuery } from "@/pages/app/functions/service";

const AddPolicyModal = (props: {
  children: React.ReactElement;
  isEdit?: boolean;
  defaultData?: any;
}) => {
  type FormData = {
    name: string;
    injector?: string;
  };
  const functionListQuery = useFunctionListQuery({ onSuccess: (data: any) => {} });
  const { isEdit, defaultData = {} } = props;
  const {
    register,
    handleSubmit,
    setFocus,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>(defaultData);

  const createPolicyMutation = useCreatePolicyMutation();
  const updatePolicyMutation = useUpdatePolicyMutation();

  const onSubmit = async (data: any) => {
    if (isEdit) {
      await updatePolicyMutation.mutateAsync({ name: data.name, injector: data.injector });
    } else {
      await createPolicyMutation.mutateAsync({ name: data.name });
    }
    onClose();
    reset({});
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [address, setAddress] = useState(`/proxy/${defaultData?.name || ""}`);

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "name") {
        setAddress(`/proxy/${value.name}`);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setAddress]);

  return (
    <>
      {React.cloneElement(props.children, {
        onClick: () => {
          onOpen();
          reset(defaultData);
          setTimeout(() => setFocus(isEdit ? "injector" : "name"), 0);
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{(isEdit ? t("Edit") : t("Add")) + t("CollectionPanel.Policy")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isInvalid={!!errors?.name}>
                <FormLabel htmlFor="name">{t("CollectionPanel.PolicyName")}</FormLabel>
                <Input
                  {...register("name", {
                    required: "name is required",
                  })}
                  id="name"
                  variant="filled"
                  readOnly={isEdit}
                  placeholder={t("CollectionPanel.PolicyNameTip").toString()}
                />
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="address">{t("CollectionPanel.PolicyAddress")}</FormLabel>
                <Input value={address} variant="filled" readOnly />
              </FormControl>

              {isEdit ? (
                <FormControl>
                  <FormLabel htmlFor="injector">injector</FormLabel>
                  <Select
                    {...register("injector", {
                      required: "injector is required",
                    })}
                    id="injector"
                    variant="filled"
                    placeholder={t("CollectionPanel.SelectFunction").toString()}
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
              ) : null}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              isLoading={createPolicyMutation.isLoading}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              {t("Confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

AddPolicyModal.displayName = "AddPolicyModal";

export default AddPolicyModal;
