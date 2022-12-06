import React from "react";
import {
  Button,
  ButtonGroup,
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

export default function DeleteButton(props: { data: any }) {
  const { isOpen, onOpen, onToggle, onClose } = useDisclosure();

  return (
    <>
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} closeOnBlur={false}>
        <PopoverTrigger>
          <Button size="xs" px="2" className="mr-2 w-16" onClick={() => {}}>
            Delete
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader fontWeight="semibold">Confirmation</PopoverHeader>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>Are you sure you want to continue with your action?</PopoverBody>
          <PopoverFooter display="flex" justifyContent="flex-end">
            <ButtonGroup size="sm">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={() => onClose()}>
                Apply
              </Button>
            </ButtonGroup>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </>
  );
}
