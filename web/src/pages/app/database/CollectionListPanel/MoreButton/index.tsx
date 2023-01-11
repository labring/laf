import { Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@chakra-ui/react";

import { MoreIcon } from "@/components/CommonIcon/index";
import CopyText from "@/components/CopyText";
import IconWrap from "@/components/IconWrap";

import DeleteCollectionModal from "../../mods/DeleteCollectionModal";

export default function MoreButton(props: { data?: any; fn?: any }) {
  const { data } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        closeOnBlur={true}
        placement="bottom"
      >
        <IconWrap size={28} tooltip="更多操作">
          <PopoverTrigger>
            <MoreIcon
              fontSize={10}
              className="align-middle"
              onClick={(event) => {
                event?.stopPropagation();
              }}
            />
          </PopoverTrigger>
        </IconWrap>
        <PopoverContent p="2" maxWidth={100}>
          <div className="flex">
            <IconWrap>
              <CopyText text={data.name} tip="名称复制成功" />
            </IconWrap>
            <DeleteCollectionModal database={data} />
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
