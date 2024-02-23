import React from "react";
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
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

interface ConfirmButtonProps {
  onSuccessAction: React.MouseEventHandler<HTMLButtonElement>;
  headerText: string;
  bodyText: string | React.ReactElement | any;
  confirmButtonText?: string;
  hideContextMenu?: () => void;
  children: React.ReactElement;
}

const ConfirmButton = ({
  onSuccessAction,
  headerText,
  bodyText,
  confirmButtonText,
  hideContextMenu,
  children,
}: ConfirmButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<any>();

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onSuccessAction(event);
    onClose();
    hideContextMenu && hideContextMenu();
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: (event: any) => {
          event?.stopPropagation();
          onOpen();
        },
      })}

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {headerText}
          </AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            <Box>{bodyText}</Box>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button colorScheme={"red"} onClick={onSubmit}>
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
