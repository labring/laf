import { DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";

import IconWrap from "@/components/IconWrap";

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
        <IconWrap
          className="hover:bg-third-100 group/icon"
          showBg
          tooltip="删除"
          size={32}
          onClick={(event: any) => {
            event?.stopPropagation();
          }}
        >
          <PopoverTrigger>
            <DeleteIcon fontSize={12} className="align-middle group-hover/icon:text-third-500" />
          </PopoverTrigger>
        </IconWrap>
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
