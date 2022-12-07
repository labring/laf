import React, { useEffect } from "react";
import { CopyIcon } from "@chakra-ui/icons";
import { useClipboard } from "@chakra-ui/react";
import useGlobalStore from "pages/globalStore";

export default function CopyText(props: { text: string; tip?: string }) {
  const { onCopy, setValue } = useClipboard("");
  const { showSuccess } = useGlobalStore();

  const text = props.text;
  useEffect(() => {
    setValue(text);
  }, [setValue, text]);

  return (
    <CopyIcon
      className="ml-1"
      fontSize={12}
      onClick={() => {
        onCopy();
        showSuccess(props.tip || "复制成功");
      }}
    />
  );
}
