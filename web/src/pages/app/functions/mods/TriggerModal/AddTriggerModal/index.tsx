import React from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Link,
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

import { useCreateTriggerMutation } from "../service";
import {} from "../service";

import { useFunctionListQuery } from "@/pages/app/functions/service";

const CRON_TEMPLATE = [
  {
    label: t("TriggerPanel.EveryFiveMinutes"),
    value: "*/5 * * * *",
  },
  {
    label: t("TriggerPanel.EveryHour"),
    value: "0 * * * *",
  },
  {
    label: t("TriggerPanel.Every8AM"),
    value: "0 8 * * *",
  },
];

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
    setValue,
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
          <ModalHeader>{t("TriggerPanel.AddTrigger")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="flex-start">
              <FormControl isInvalid={!!errors?.desc}>
                <FormLabel htmlFor="desc">{t("TriggerPanel.Name")}</FormLabel>
                <Input
                  {...register("desc", {
                    required: "desc is required",
                  })}
                  id="desc"
                  variant="filled"
                  placeholder={t("TriggerPanel.NameTip").toString()}
                />
                <FormErrorMessage>{errors.desc && errors.desc.message}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="target">{t("TriggerPanel.Function")}</FormLabel>
                <Select
                  {...register("target", {
                    required: "target is required",
                  })}
                  id="target"
                  disabled={!!targetFunc}
                  variant="filled"
                  placeholder={t("TriggerPanel.FunctionTip").toString()}
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
                <FormLabel htmlFor="name">{t("TriggerPanel.Type")}</FormLabel>
                <Input value={t("TriggerPanel.SetTimeout").toString()} variant="filled" readOnly />
              </FormControl>
              <FormControl isInvalid={!!errors?.cron}>
                <FormLabel htmlFor="cron">Cron {t("TriggerPanel.Express")} </FormLabel>
                <Input
                  {...register("cron", {
                    required: "cron is required",
                  })}
                  id="desc"
                  variant="filled"
                  placeholder={t("TriggerPanel.CornTip").toString()}
                />
                <FormErrorMessage>{errors.cron && errors.cron.message}</FormErrorMessage>
                <HStack className="mt-2" spacing="2">
                  {CRON_TEMPLATE.map((item) => (
                    <span
                      key={item.label}
                      className="ml-2 cursor-pointer text-blue-500"
                      onClick={() => {
                        setValue("cron", item.value);
                      }}
                    >
                      {item.label}
                    </span>
                  ))}
                  <Link
                    isExternal
                    target="_blank"
                    href="https://crontab.guru/examples.html"
                    rel="noreferrer"
                    className="text-blue-500"
                  >
                    {t("TriggerPanel.CronHelp")}
                  </Link>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={addTriggerMutation.isLoading}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              {t("Create")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

AddTriggerModal.displayName = "AddTriggerModal";

export default AddTriggerModal;
