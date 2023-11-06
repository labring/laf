import { Spinner, useColorMode } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";

import { AutoImportTypings } from "@/components/Editor/typesResolve";
import { COLOR_MODE } from "@/constants";

export default function TSEditor(props: {
  value: string;
  fontSize: number;
  onChange?: (value: string | undefined) => void;
}) {
  const {
    value,
    fontSize,
    onChange
  } = props;

  const { colorMode } = useColorMode();

  // const monaco = useMonaco();
  const autoImportTypings = new AutoImportTypings();

  const options = {
    minimap: {
      enabled: false,
    },
    language: "typescript",
    automaticLayout: true,
    scrollbar: {
      verticalScrollbarSize: 4,
      horizontalScrollbarSize: 8,
    },
    formatOnPaste: true,
    overviewRulerLanes: 0,
    lineNumbersMinChars: 4,
    fontSize: fontSize,
    scrollBeyondLastLine: false,
  };

  return (
    <Editor
      height={"100%"}
      defaultLanguage="typescript"
      value={value}
      options={options}
      onChange={onChange}
      theme={colorMode === COLOR_MODE.dark ? "lafEditorThemeDark" : "lafEditorTheme"}
      loading={
        (
          <div>
            <Spinner />
          </div>
        )
      }
      beforeMount={(monaco) => {
        monaco?.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ESNext,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          allowSyntheticDefaultImports: true,
          noEmit: true,
          allowJs: false,
          sourceMap: true,
          noImplicitAny: false,
        });
        
        monaco?.editor.defineTheme("lafEditorTheme", {
          base: "vs",
          inherit: true,
          rules: [
            {
              foreground: "#008189",
              token: "keyword",
            },
          ],
          colors: {
            "editorLineNumber.foreground": "#aaa",
            "editorOverviewRuler.border": "#fff",
            "editor.lineHighlightBackground": "#F7F8FA",
            "scrollbarSlider.background": "#E8EAEC",
            "editorIndentGuide.activeBackground": "#fff",
            "editorIndentGuide.background": "#eee",
          },
        });
        
        monaco?.editor.defineTheme("lafEditorThemeDark", {
          base: "vs-dark",
          inherit: true,
          rules: [
            {
              foreground: "65737e",
              token: "punctuation.definition.comment",
            },
          ],
          colors: {
            "editor.foreground": "#ffffff",
            "editor.background": "#202631",
            "editorIndentGuide.activeBackground": "#fff",
            "editorIndentGuide.background": "#eee",
            "editor.selectionBackground": "#101621",
            "menu.selectionBackground": "#101621",
            "dropdown.background": "#1a202c",
            "dropdown.foreground": "#f0f0f0",
            "dropdown.border": "#fff",
            "quickInputList.focusBackground": "#1a202c",
            "editorWidget.background": "#1a202c",
            "editorWidget.foreground": "#f0f0f0",
            "editorWidget.border": "#1a202c",
            "input.background": "#1a202c",
            "list.hoverBackground": "#2a303c",
          },
        });
  
        const defaults = monaco?.languages.typescript.typescriptDefaults;
        autoImportTypings.loadDefaults(defaults);
        autoImportTypings.parse(value, defaults);
      }}
      onValidate={() => {
        // const defaults = monaco?.languages.typescript.typescriptDefaults;
        // autoImportTypings.parse(value, defaults)
      }}
    />
  );
}
