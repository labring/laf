import React, { useEffect } from "react";
import { CopyIcon } from "@chakra-ui/icons";
import { Tooltip, useClipboard } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import useGlobalStore from "@/pages/globalStore";

export default function CopyText(props: {
  text?: string;
  tip?: string;
  className?: string;
  children?: React.ReactElement;
  hideToolTip?: boolean;
}) {
  const { onCopy, setValue } = useClipboard("");
  const { showSuccess } = useGlobalStore();

  const {
    children = <CopyIcon fontSize={10} color="#999" />,
    text,
    tip,
    className,
    hideToolTip,
  } = props;

  useEffect(() => {
    setValue(text || "");
  }, [setValue, text]);

  return (
    <Tooltip label={hideToolTip ? "" : t("Copy")} placement="top">
      {React.cloneElement(children, {
        className: clsx("cursor-pointer", className),
        onClick: () => {
          onCopy();
          showSuccess(tip || t("Copied"));
        },
      })}
    </Tooltip>
  );
}
