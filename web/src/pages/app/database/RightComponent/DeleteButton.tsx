import { DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";
import { t } from "i18next";

import IconWrap from "@/components/IconWrap";

export default function DeleteButton(props: { data: any; deleteMethod: any }) {
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
        <IconWrap
          className="hover:bg-third-100 group/icon"
          showBg
          tooltip={t("Common.Delete").toString()}
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
              {t("Common.Cancel")}
            </Button>
            <Button
              colorScheme="red"
              isLoading={props.deleteMethod.isLoading}
              onClick={async (event) => {
                event?.stopPropagation();
                await props.deleteMethod.mutateAsync(props.data);
              }}
            >
              {t("Common.Confirm")}
            </Button>
          </ButtonGroup>
        </PopoverContent>
      </Popover>
    </>
  );
}
