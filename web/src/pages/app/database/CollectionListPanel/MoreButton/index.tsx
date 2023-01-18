import { Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@chakra-ui/react";
import { t } from "i18next";

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
        <IconWrap size={25} tooltip={t("moreOperations").toString()}>
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
        <PopoverContent p="2" maxWidth="100px">
          <div className="flex justify-around">
            <div>
              <IconWrap>
                <CopyText text={data.name} className="w-[28px]" tip="名称复制成功" />
              </IconWrap>
              {t("Copy")}
            </div>
            <div>
              <DeleteCollectionModal database={data} />
              {t("Delete")}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
