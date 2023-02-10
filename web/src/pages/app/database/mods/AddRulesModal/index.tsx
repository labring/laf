import { useState } from "react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
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

import JsonEditor from "@/components/Editor/JsonEditor";

import { useCollectionListQuery, useCreateRulesMutation } from "../../service";

import policyTemplate from "./policyTemplate";

const AddRulesModal = (props: {
  children: React.ReactElement;
  onSuccessSubmit: (data: any) => void;
}) => {
  type FormData = {
    collectionName: string;
    value: string;
  };
  const {
    register,
    handleSubmit,
    setFocus,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({});

  const createRulesMutation = useCreateRulesMutation();
  const collectionListQuery = useCollectionListQuery();
  const [parseError, setParseError] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");

  const onSubmit = async (data: any) => {
    try {
      JSON.parse(data.value);
      setParseError("");
    } catch (errors) {
      setParseError(errors?.toString());
      return;
    }
    try {
      const res = await createRulesMutation.mutateAsync(data);
      if (res.error) {
        throw new Error(res?.error);
      }
      props.onSuccessSubmit(res.data);
      onClose();
    } catch (errors) {
      setError(errors?.toString());
      return;
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {React.cloneElement(props.children, {
        onClick: () => {
          onOpen();
          setError("");
          setParseError("");
          reset({
            collectionName: collectionListQuery?.data?.data[0]?.name,
            value: JSON.stringify(policyTemplate, null, 2),
          });
          setTimeout(() => setFocus("collectionName"), 0);
        },
      })}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("Add") + t("CollectionPanel.Policy")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <p className="text-error-600">{error}</p>
              <FormControl isInvalid={!!errors?.collectionName}>
                <FormLabel htmlFor="collectionName">
                  {t("CollectionPanel.SelectCollection")}
                </FormLabel>
                <Select
                  {...register("collectionName", {
                    required: "collectionName is required",
                  })}
                  placeholder={collectionListQuery?.data?.data?.length ? undefined : "暂无可选集合"}
                  id="collectionName"
                  variant="filled"
                >
                  {(collectionListQuery?.data?.data || []).map((item: any) => {
                    return (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    );
                  })}
                </Select>
                <FormErrorMessage>
                  {errors.collectionName && errors.collectionName.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!parseError}>
                <FormLabel htmlFor="value"> {t("CollectionPanel.RulesContent")}</FormLabel>
                <FormErrorMessage className="mb-4">{parseError}</FormErrorMessage>
                <Controller
                  name="value"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="h-[280px] bg-lafWhite-400 rounded pr-2">
                      <JsonEditor value={value} onChange={onChange} />
                    </div>
                  )}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              isLoading={createRulesMutation.isLoading}
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

AddRulesModal.displayName = "AddRulesModal";

export default AddRulesModal;
