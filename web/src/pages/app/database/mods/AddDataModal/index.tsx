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
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { t } from "i18next";

import JsonEditor from "@/components/Editor/JsonEditor";

import { useAddDataMutation } from "../../service";

const AddDataModal = (props: { children: React.ReactElement; onSuccessSubmit: () => void }) => {
  type FormData = {
    value: string;
  };
  const { handleSubmit, control, reset } = useForm<FormData>({});

  const addDataMutation = useAddDataMutation();
  const [error, setError] = useState<string | undefined>("");
  const onSubmit = async (data: any) => {
    let params = {};
    try {
      params = JSON.parse(data.value);
      if (Object.keys(params).length === 0) {
        setError(String(t("DataEntry.CreateError")));
        return;
      }
      setError("");
      await addDataMutation.mutateAsync(params);
      props.onSuccessSubmit();
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
          reset({ value: JSON.stringify({}, null, 2) });
        },
      })}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader> {t("CollectionPanel.AddData")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <p>{}</p>
            <VStack spacing={6} align="flex-start">
              <FormControl isInvalid={!!error}>
                <FormErrorMessage className="ml-2 mb-4">{error}</FormErrorMessage>
                <FormLabel htmlFor="value"></FormLabel>
                <Controller
                  name="value"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="h-[300px] bg-lafWhite-400 rounded pr-2">
                      <JsonEditor value={value} onChange={onChange} />
                    </div>
                  )}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              isLoading={addDataMutation.isLoading}
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

AddDataModal.displayName = "AddDataModal";

export default AddDataModal;
