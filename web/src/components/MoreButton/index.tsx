import { useEffect, useState } from "react";
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
  className?: string;
  isClicked?: boolean;
}) {
  const { children, isHidden, maxWidth, label = t("openPopover"), className, isClicked } = props;
  const [open, setOpen] = useState(isClicked);

  const { isOpen, onOpen, onClose } = useDisclosure({
    isOpen: open,
    onClose: () => {
      setOpen(false);
    },
    onOpen: () => {
      setOpen(true);
    },
  });

  useEffect(() => {
    setOpen(isClicked);
  }, [isClicked]);

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
                <MoreIcon className="cursor-pointer align-middle" fontSize={12} onClick={onOpen} />
              </div>
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent p="2" maxWidth={maxWidth ? maxWidth : "120px"} className={className}>
          <div className="flex justify-around space-x-2">{children}</div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
