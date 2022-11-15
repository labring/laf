import { Button } from "@chakra-ui/react";
import Editor, { useMonaco } from "@monaco-editor/react";
export default function ColPannel() {
  return (
    <div className="border mt-4 p-2 rounded-sm relative group">
      <div className=" absolute right-2 top-0 hidden group-hover:block z-50">
        <Button size="sx" className="mr-2">
          edit
        </Button>
        <Button size="sx">delete</Button>
      </div>
      <Editor
        theme="my-theme"
        language="json"
        defaultValue={`{\n\t"name":"hello"\n}`}
        width={"100%"}
        height="120px"
        options={{
          readOnly: true,
          lineNumber: false,
          guides: {
            indentation: false,
          },
          minimap: {
            enabled: false,
          },
          lineHighlightBackground: "red",
          scrollbar: {
            verticalScrollbarSize: 0,
            alwaysConsumeMouseWheel: false,
          },
          lineNumbers: "off",
          lineNumbersMinChars: 0,
          scrollBeyondLastLine: false,
          folding: false,
          overviewRulerBorder: false,
          tabSize: 2, // tab 缩进长度
        }}
      />
    </div>
  )
};