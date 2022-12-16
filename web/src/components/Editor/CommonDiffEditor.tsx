import { DiffEditor as MonacoDiffEditor } from "@monaco-editor/react";

export default function CommonDiffEditor(props: { original: string; modified: string }) {
  const { original, modified } = props;

  return (
    <div className="">
      <MonacoDiffEditor
        options={{
          readOnly: true,
          automaticLayout: true,
          minimap: {
            enabled: false,
          },
          fontSize: 14,
          // fontFamily: "monospace",
          scrollBeyondLastLine: false,
        }}
        height="70vh"
        onMount={(editor, monaco) => {
          monaco.editor.setTheme("lafEditorTheme");
        }}
        original={original}
        modified={modified}
        language={"typescript"}
      />
    </div>
  );
}
