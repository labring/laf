import React from "react";
import { CopyIcon } from "@chakra-ui/icons";
import { useClipboard, useToast } from "@chakra-ui/react";

export default function CopyText(props: { text: string }) {
  const { onCopy, hasCopied } = useClipboard(props.text);
  const toast = useToast();

  return (
    <CopyIcon
      onClick={() => {
        onCopy();
        toast({
          position: "bottom",
          title: "复制成功",
          status: "success",
          duration: 600,
        });
      }}
    />
  );
}
