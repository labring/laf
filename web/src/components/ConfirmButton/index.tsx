import React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  useDisclosure,
} from "@chakra-ui/react";

interface ConfirmButtonProps {
  onSuccessAction: () => void;
  headerText: string;
  bodyText: string;

  children: React.ReactElement;
}

const ConfirmButton = ({ onSuccessAction, headerText, bodyText, children }: ConfirmButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<any>();

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

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {headerText}
          </AlertDialogHeader>
          <AlertDialogBody>
            <Box>{bodyText}</Box>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} className="mr-3">
              取消
            </Button>
            <Button colorScheme={"red"} onClick={onSubmit}>
              删除
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
export default ConfirmButton;
