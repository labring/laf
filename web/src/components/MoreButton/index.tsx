import { Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { MoreIcon } from "@/components/CommonIcon/index";
import IconWrap from "@/components/IconWrap";

export default function MoreButton(props: {
  children: React.ReactElement;
  isHidden: boolean;
  maxWidth?: string;
}) {
  const { children, isHidden, maxWidth } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <div className={clsx("flex group-hover:visible ", isHidden ? "invisible" : "visible")}>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        closeOnBlur={true}
        placement="bottom"
      >
        <IconWrap
          size={25}
          className="text-grayIron-600 hover:bg-[#f0f9f9] -mr-2"
          tooltip={t("moreOperations").toString()}
        >
          <PopoverTrigger>
            <MoreIcon
              className="align-middle "
              fontSize={12}
              onClick={(event) => {
                event?.stopPropagation();
              }}
            />
          </PopoverTrigger>
        </IconWrap>
        <PopoverContent p="2" maxWidth={maxWidth ? maxWidth : "100px"}>
          <div className="flex justify-around">{children}</div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
