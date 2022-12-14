import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";

export default function DeleteButton(props: { data: any }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        closeOnBlur={true}
        placement="left"
      >
        <PopoverTrigger>
          <Button size="xs" px="2" className="mr-2 w-16" onClick={() => {}}>
            Delete
          </Button>
        </PopoverTrigger>
        <PopoverContent p="2" maxWidth={130}>
          <ButtonGroup size="xs">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={() => onClose()}>
              Apply
            </Button>
          </ButtonGroup>
        </PopoverContent>
      </Popover>
    </>
  );
}
