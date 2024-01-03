import { useCallback, useRef, useState } from "react";
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
} from "@chakra-ui/react";

interface ConfirmDialogProps {
  onConfirm: React.MouseEventHandler<HTMLButtonElement>;
  headerText: string;
  bodyText: string | React.ReactElement | any;
  confirmButtonText?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ConfirmDialog = ({
  onConfirm,
  headerText,
  bodyText,
  confirmButtonText,
  isOpen,
  onClose,
}: ConfirmDialogProps) => {
  const cancelRef = useRef(null);

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onConfirm(event);
    onClose();
  };

  return (
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
          <Button onClick={onSubmit}>{confirmButtonText}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const useConfirmDialog = () => {
  const [isOpen, setOpen] = useState(false);
  const [data, setData] = useState<Omit<Omit<ConfirmDialogProps, "isOpen">, "onClose"> | null>(
    null,
  );

  const show = useCallback((data: Omit<Omit<ConfirmDialogProps, "isOpen">, "onClose">) => {
    setOpen(true);
    setData({
      ...data,
    });
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const Dialog = useCallback(
    () => (data ? <ConfirmDialog {...data} isOpen={isOpen} onClose={onClose} /> : <></>),
    [data, isOpen, onClose],
  );
  return {
    Dialog,
    show,
    onClose,
    isOpen,
  };
};

export default ConfirmDialog;
