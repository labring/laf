import { useColorMode } from "@chakra-ui/react";
import { DiffEditor } from "@monaco-editor/react";

import { COLOR_MODE } from "@/constants";

export default function CommonDiffEditor(props: { original: string; modified: string }) {
  const { original, modified } = props;
  const { colorMode } = useColorMode();

  const options = {
    readOnly: true,
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
    renderOverviewRuler: false,
    fontSize: 14,
    scrollBeyondLastLine: false,
    scrollbar: {
      verticalScrollbarSize: 4,
      horizontalScrollbarSize: 6,
      alwaysConsumeMouseWheel: false,
    },
  };
  return (
    <DiffEditor
      original={original}
      modified={modified}
      height={"70vh"}
      options={options}
      language="typescript"
      theme={colorMode === COLOR_MODE.dark ? "vs-dark" : "vs"}
    />
  );
}
