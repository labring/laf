import {
  Box,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { MoreIcon } from "@/components/CommonIcon/index";

export default function MoreButton(props: {
  children: React.ReactElement;
  isHidden: boolean;
  label: string;
  maxWidth?: string;
}) {
  const { children, isHidden, maxWidth, label = t("openPopover") } = props;
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
        <Tooltip aria-label="tooltip" placement="bottom" label={label}>
          <Box display="inline-block">
            <PopoverTrigger>
              <div className="px-1">
                <MoreIcon className="align-middle" fontSize={12} />
              </div>
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent p="2" maxWidth={maxWidth ? maxWidth : "100px"}>
          <div className="flex justify-around">{children}</div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
