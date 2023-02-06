import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AddIcon } from "@chakra-ui/icons";
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
import useDBMStore from "../../store";

import policyTemplate from "./policyTemplate";

const AddRulesModal = (props: { onSuccessSubmit: (data: any) => void }) => {
  type FormData = {
    collectionName: string;
    value: string;
  };
  const store = useDBMStore((state) => state);
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
      <Button
        disabled={store.currentPolicy === undefined}
        colorScheme="primary"
        className="mr-2"
        style={{ width: "114px" }}
        leftIcon={<AddIcon />}
        onClick={() => {
          onOpen();
          setError("");
          setParseError("");
          reset({
            collectionName: collectionListQuery?.data?.data[0]?.name,
            value: JSON.stringify(policyTemplate, null, 2),
          });
          setTimeout(() => setFocus("collectionName"), 0);
        }}
      >
        {t("CollectionPanel.AddRules")}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("Add") + t("CollectionPanel.Policy")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <p>{error}</p>
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
