import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";

import { SendSmsCodeButton } from "@/components/SendSmsCodeButton";

type FormData = {
  oldPhone: string;
  oldSmsNumber: string;
  newPhone: string;
  newSmsNumber: string;
};

export default function PhoneEditor(props: { setShowItem: any }) {
  const { setShowItem } = props;
  const { t } = useTranslation();
  const [oldPhone, setOldPhone] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      oldPhone: "",
      oldSmsNumber: "",
      newPhone: "",
      newSmsNumber: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log(data);
  };

  return (
    <>
      <span
        onClick={() => setShowItem("")}
        className="absolute left-[280px] flex cursor-pointer items-center"
      >
        <ChevronLeftIcon boxSize={6} /> {t("Back")}
      </span>
      <VStack className="flex w-full flex-col">
        <span className="w-full text-center text-xl">{t("UserInfo.EditPhone")}</span>
        <Box className="flex flex-col">
          <FormControl isInvalid={!!errors?.oldPhone} className="flex flex-col justify-center">
            <div className="pb-2">{t("UserInfo.OldPhoneNumber")}</div>
            <InputGroup>
              <Input
                {...register("oldPhone", { required: true })}
                width={64}
                bg={"#F8FAFB"}
                border={"1px"}
                borderColor={"#D5D6E1"}
                onChange={(e) => {
                  setOldPhone(e.target.value);
                }}
              />
              <InputRightElement width="6rem">
                <SendSmsCodeButton phone={oldPhone} />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isInvalid={!!errors.oldSmsNumber} className="flex flex-col justify-center">
            <div className="py-2">{t("UserInfo.OldSmsNumber")}</div>
            <Input
              {...register("oldSmsNumber", { required: true })}
              width={64}
              bg={"#F8FAFB"}
              border={"1px"}
              borderColor={"#D5D6E1"}
            />
          </FormControl>
          <FormControl isInvalid={!!errors.newPhone} className="flex flex-col justify-center">
            <div className="py-2">{t("UserInfo.NewPhoneNumber")}</div>
            <InputGroup>
              <Input
                {...register("newPhone", { required: true })}
                width={64}
                bg={"#F8FAFB"}
                border={"1px"}
                borderColor={"#D5D6E1"}
                onChange={(e) => {
                  setNewPhone(e.target.value);
                }}
              />
              <InputRightElement width="6rem">
                <SendSmsCodeButton phone={newPhone} />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isInvalid={!!errors.newSmsNumber} className="flex flex-col justify-center">
            <div className="py-2">{t("UserInfo.NewSmsNumber")}</div>
            <Input
              {...register("newSmsNumber", { required: true })}
              width={64}
              bg={"#F8FAFB"}
              border={"1px"}
              borderColor={"#D5D6E1"}
            />
          </FormControl>
          <Button width={64} mt={8} onClick={handleSubmit(onSubmit)}>
            {t("Save")}
          </Button>
        </Box>
      </VStack>
    </>
  );
}
