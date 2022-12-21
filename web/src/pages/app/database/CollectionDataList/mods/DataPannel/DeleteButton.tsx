import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";

import { useDeleteDataMutation } from "../../../service";

export default function DeleteButton(props: { data: any; fn: any }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteDataMutation = useDeleteDataMutation({
    onSuccess(data) {
      props.fn(undefined);
    },
  });

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
          <Button
            size="xs"
            px="2"
            className="mr-2 w-16"
            onClick={(event) => {
              event?.stopPropagation();
            }}
          >
            Delete
          </Button>
        </PopoverTrigger>
        <PopoverContent p="2" maxWidth={130}>
          <ButtonGroup size="xs">
            <Button
              variant="outline"
              onClick={(event) => {
                event?.stopPropagation();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              isLoading={deleteDataMutation.isLoading}
              onClick={async (event) => {
                event?.stopPropagation();
                await deleteDataMutation.mutateAsync(props.data);
              }}
            >
              Apply
            </Button>
          </ButtonGroup>
        </PopoverContent>
      </Popover>
    </>
  );
}
