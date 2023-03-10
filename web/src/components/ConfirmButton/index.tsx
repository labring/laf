import React from "react";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  Spacer,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

interface ConfirmButtonProps {
  onSuccessAction: () => void;
  headerText: string;
  bodyText: string;
  confirmButtonText?: string;
  confirmText?: string;
  children: React.ReactElement;
}

const ConfirmButton = ({
  onSuccessAction,
  headerText,
  bodyText,
  confirmButtonText,
  confirmText,
  children,
}: ConfirmButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<any>();

  type FormData = {
    confirmText: string;
  };

  const defaultValues = {
    confirmText: "",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

  const onSubmit = () => {
    onSuccessAction();
    onClose();
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: (event: any) => {
          event?.preventDefault();
          onOpen();
        },
      })}

      <AlertDialog
        isOpen={isOpen}
        closeOnOverlayClick={false}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {headerText}
          </AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            <Box>{bodyText}</Box>
            {confirmText && confirmText.length !== 0 ? (
              <Flex direction="column">
                <Spacer />
                <Box h="30px">
                  {" 请在下方输入框输入 "}
                  <Tag>{confirmText}</Tag>
                  {" 确认删除："}
                </Box>
                <Spacer />
                <FormControl isRequired isInvalid={!!errors?.confirmText}>
                  <Input
                    placeholder=""
                    size="sm"
                    {...register("confirmText", {
                      required: true,
                      validate: (value) => value === confirmText,
                    })}
                  />
                  <FormErrorMessage>
                    {errors?.confirmText && errors?.confirmText?.message}
                  </FormErrorMessage>
                </FormControl>
              </Flex>
            ) : (
              <></>
            )}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button colorScheme={"red"} onClick={handleSubmit(onSubmit)}>
              {confirmButtonText && confirmButtonText.length !== 0
                ? confirmButtonText
                : t("Delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default ConfirmButton;
