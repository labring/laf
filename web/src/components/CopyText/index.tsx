import React, { useEffect } from "react";
import { CopyIcon } from "@chakra-ui/icons";
import { Tooltip, useClipboard } from "@chakra-ui/react";
import { t } from "i18next";

import useGlobalStore from "@/pages/globalStore";

export default function CopyText(props: {
  text: string;
  tip?: string;
  className?: string;
  children?: React.ReactElement;
  hideToolTip?: boolean;
}) {
  const { onCopy, setValue } = useClipboard("");
  const { showSuccess } = useGlobalStore();

  const { children = <CopyIcon />, text, tip, className, hideToolTip } = props;

  useEffect(() => {
    setValue(text);
  }, [setValue, text]);

  return (
    <Tooltip label={hideToolTip ? "" : t("Copy")} placement="top">
      {React.cloneElement(children, {
        className: className || "",
        onClick: () => {
          onCopy();
          showSuccess(tip || t("Copied"));
        },
      })}
    </Tooltip>
  );
}
