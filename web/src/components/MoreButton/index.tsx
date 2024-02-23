import {
  Box,
  Button,
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
  refItem?: React.RefObject<HTMLDivElement>;
}) {
  const { children, isHidden, maxWidth, label = t("openPopover"), className } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <div className={clsx("flex group-hover:visible ", isHidden ? "invisible" : "visible")}>
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement="bottom">
        <Tooltip aria-label="tooltip" placement="bottom" label={label}>
          <Box display="inline-block">
            <PopoverTrigger>
              <Button variant="none" p={0} minW={0} h={0} w={5}>
                <MoreIcon className="cursor-pointer align-middle" fontSize={12} />
              </Button>
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent p="2" maxWidth={maxWidth ? maxWidth : "120px"} className={className}>
          <div className="flex justify-around">{children}</div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
