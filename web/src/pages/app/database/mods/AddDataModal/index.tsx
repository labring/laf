import { useEffect, useState } from "react";
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
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import JsonEditor from "@/components/Editor/JsonEditor";

import { useAddDataMutation } from "../../service";

const AddDataModal = (props: {
  children: React.ReactElement;
  onSuccessSubmit?: (id: string, count: number) => void;
  schema: Object;
}) => {
  type FormData = {
    value: string;
  };
  const { handleSubmit, control, reset } = useForm<FormData>({});
  const { children, onSuccessSubmit, schema } = props;
  const [template, setTemplate] = useState({});

  useEffect(() => {
    const keys = Object.keys(schema).filter((key) => key !== "_id");
    const newTemplate: { [key: string]: any } = {};
    for (let key of keys) {
      newTemplate[key] = "";
    }
    setTemplate(newTemplate);
  }, [schema, setTemplate]);

  const addDataMutation = useAddDataMutation({
    onSuccess: (data) => {
      const { insertedCount, id } = data;
      let lastId = undefined;
      if (typeof id !== "string") {
        const keys = Object.keys(id);
        lastId = id[keys[keys.length - 1]];
      } else {
        lastId = id;
      }
      onSuccessSubmit && onSuccessSubmit(lastId, insertedCount > 1 ? insertedCount : 1);
    },
  });
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
      onClose();
    } catch (errors) {
      setError(errors?.toString());
      return;
    }
  };
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          onOpen();
          setError("");
          reset({ value: JSON.stringify(template, null, 2) });
        },
      })}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent className="h-[80vh]">
          <ModalHeader> {t("CollectionPanel.AddData")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start" className="h-full">
              <FormControl isInvalid={!!error} className="h-full ">
                <FormErrorMessage className="mb-1 ml-2 ">{error}</FormErrorMessage>
                <FormLabel htmlFor="value"></FormLabel>
                <Controller
                  name="value"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div
                      className={clsx("rounded pr-2", {
                        "bg-lafWhite-400": !darkMode,
                        "bg-lafDark-200": darkMode,
                      })}
                      style={{ height: "calc(100% - 1rem)" }}
                    >
                      <JsonEditor colorMode={colorMode} value={value} onChange={onChange} />
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
