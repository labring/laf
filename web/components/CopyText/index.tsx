import React, { useEffect } from "react";
import { CopyIcon } from "@chakra-ui/icons";
import { useClipboard } from "@chakra-ui/react";
import useGlobalStore from "pages/globalStore";

export default function CopyText(props: { text: string }) {
  const { onCopy, setValue } = useClipboard("");
  const { showSuccess } = useGlobalStore();

  const text = props.text;
  useEffect(() => {
    setValue(text);
  }, [setValue, text]);

  return (
    <CopyIcon
      onClick={() => {
        onCopy();
        showSuccess("复制成功");
      }}
    />
  );
}
