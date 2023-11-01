import React, { FC, useCallback } from "react";
import {
  Button,
  ButtonGroup,
  PlacementWithLogical,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

interface PopConfirmProps {
  title: string | React.ReactElement | any;
  description: string | React.ReactElement | any;
  onConfirm?: React.MouseEventHandler<HTMLButtonElement>;
  onCancel?: React.MouseEventHandler<HTMLButtonElement>;
  okText?: string;
  cancelText?: string;
  placement?: PlacementWithLogical;
  children: React.ReactNode;
}

const PopConfirm: FC<PopConfirmProps> = ({
  children,
  title,
  description,
  onConfirm,
  onCancel,
  okText,
  cancelText,
  placement,
}) => {
  const { onOpen, onClose, isOpen } = useDisclosure();

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      onConfirm?.(event);
      onClose();
    },
    [onClose, onConfirm],
  );

  const onPopCancel: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      onCancel?.(event);
      onClose();
    },
    [onClose, onCancel],
  );

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement={placement}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        <PopoverCloseButton />
        <PopoverHeader pt={4} fontWeight="bold" fontSize={14}>
          {title}
        </PopoverHeader>
        <PopoverArrow />
        <PopoverBody fontSize={14} pt={4}>
          {description}
        </PopoverBody>
        <PopoverFooter border="0" pb={4}>
          <ButtonGroup display="flex" justifyContent="flex-end" size="sm">
            <Button variant="outline" onClick={onPopCancel}>
              {cancelText || t("Cancel")}
            </Button>
            <Button colorScheme="teal" onClick={onSubmit}>
              {okText || t("Confirm")}
            </Button>
          </ButtonGroup>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};
export default PopConfirm;
