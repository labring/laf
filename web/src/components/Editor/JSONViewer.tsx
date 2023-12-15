import SyntaxHighlighter, { Prism } from "react-syntax-highlighter";
import { FixedSizeList as List } from "react-window";
import SimpleBar from "simplebar-react";

import { COLOR_MODE } from "@/constants";

import "./index.scss";

type JSONViewerProps = {
  code: string;
  language?: string;
  showNumber?: boolean;
  colorMode?: string;
  className?: string;
};

const JSONViewerStyle: any = {
  hljs: {
    display: "block",
    overflowX: "auto",
    padding: "0.5em",
    color: "#000",
    background: "#f8f8ff",
  },
  "hljs-comment": {
    color: "#408080",
    fontStyle: "italic",
  },
  "hljs-quote": {
    color: "#408080",
    fontStyle: "italic",
  },
  "hljs-keyword": {
    color: "#954121",
  },
  "hljs-selector-tag": {
    color: "#954121",
  },
  "hljs-literal": {
    color: "#954121",
  },
  "hljs-subst": {
    color: "#954121",
  },
  "hljs-number": {
    color: "#01A99D",
  },
  "hljs-string": {
    color: "#0451a5",
  },
  "hljs-doctag": {
    color: "#219161",
  },
  "hljs-selector-id": {
    color: "#19469d",
  },
  "hljs-selector-class": {
    color: "#19469d",
  },
  "hljs-section": {
    color: "#19469d",
  },
  "hljs-type": {
    color: "#19469d",
  },
  "hljs-params": {
    color: "#00f",
  },
  "hljs-title": {
    color: "#458",
    fontWeight: "bold",
  },
  "hljs-tag": {
    color: "#000080",
    fontWeight: "normal",
  },
  "hljs-name": {
    color: "#000080",
    fontWeight: "normal",
  },
  "hljs-attr": {
    color: "#a31515",
    fontWeight: "normal",
  },
  "hljs-attribute": {
    color: "#000080",
    fontWeight: "normal",
  },
  "hljs-variable": {
    color: "#008080",
  },
  "hljs-template-variable": {
    color: "#008080",
  },
  "hljs-regexp": {
    color: "#b68",
  },
  "hljs-link": {
    color: "#b68",
  },
  "hljs-symbol": {
    color: "#990073",
  },
  "hljs-bullet": {
    color: "#990073",
  },
  "hljs-built_in": {
    color: "#0086b3",
  },
  "hljs-builtin-name": {
    color: "#0086b3",
  },
  "hljs-meta": {
    color: "#999",
    fontWeight: "bold",
  },
  "hljs-deletion": {
    background: "#fdd",
  },
  "hljs-addition": {
    background: "#dfd",
  },
  "hljs-emphasis": {
    fontStyle: "italic",
  },
  "hljs-strong": {
    fontWeight: "bold",
  },
};

const JSONViewerDarkStyle: any = {
  hljs: {
    display: "block",
    overflowX: "auto",
    padding: "0.5em",
    color: "#000",
    background: "#f8f8ff",
  },
  "hljs-comment": {
    color: "#408080",
    fontStyle: "italic",
  },
  "hljs-quote": {
    color: "#408080",
    fontStyle: "italic",
  },
  "hljs-keyword": {
    color: "#954121",
  },
  "hljs-selector-tag": {
    color: "#954121",
  },
  "hljs-literal": {
    color: "#954121",
  },
  "hljs-subst": {
    color: "#954121",
  },
  "hljs-number": {
    color: "#b0caa4",
  },
  "hljs-string": {
    color: "#ce9178",
  },
  "hljs-doctag": {
    color: "#219161",
  },
  "hljs-selector-id": {
    color: "#19469d",
  },
  "hljs-selector-class": {
    color: "#19469d",
  },
  "hljs-section": {
    color: "#19469d",
  },
  "hljs-type": {
    color: "#19469d",
  },
  "hljs-params": {
    color: "#00f",
  },
  "hljs-title": {
    color: "#458",
    fontWeight: "bold",
  },
  "hljs-tag": {
    color: "#000080",
    fontWeight: "normal",
  },
  "hljs-name": {
    color: "#000080",
    fontWeight: "normal",
  },
  "hljs-attr": {
    color: "#9bdcfe",
    fontWeight: "normal",
  },
  "hljs-attribute": {
    color: "#000080",
    fontWeight: "normal",
  },
  "hljs-variable": {
    color: "#008080",
  },
  "hljs-template-variable": {
    color: "#008080",
  },
  "hljs-regexp": {
    color: "#b68",
  },
  "hljs-link": {
    color: "#b68",
  },
  "hljs-symbol": {
    color: "#990073",
  },
  "hljs-bullet": {
    color: "#990073",
  },
  "hljs-built_in": {
    color: "#0086b3",
  },
  "hljs-builtin-name": {
    color: "#0086b3",
  },
  "hljs-meta": {
    color: "#999",
    fontWeight: "bold",
  },
  "hljs-deletion": {
    background: "#fdd",
  },
  "hljs-addition": {
    background: "#dfd",
  },
  "hljs-emphasis": {
    fontStyle: "italic",
  },
  "hljs-strong": {
    fontWeight: "bold",
  },
};

export default function JSONViewer(props: JSONViewerProps) {
  const { code, language = "json", colorMode = COLOR_MODE.light, ...rest } = props;
  const lightTheme = { background: "#fdfdfe", padding: 0 };
  const darkTheme = {
    background: "#202631",
    color: "#f0f0f0",
  };

  const rowHeight = 22;

  const renderRow = ({ index, style }: { index: number; style: any }) => (
    <div style={style} className="code">
      <Prism
        language={language}
        style={colorMode === COLOR_MODE.dark ? JSONViewerDarkStyle : JSONViewerStyle}
        customStyle={colorMode === COLOR_MODE.dark ? darkTheme : lightTheme}
      >
        {code.split(`\n`)[index]}
      </Prism>
    </div>
  );

  if (code.split(`\n`).length <= 100) {
    return (
      <SimpleBar
        style={{
          maxHeight: 390,
        }}
        {...rest}
      >
        <SyntaxHighlighter
          language={language}
          style={colorMode === COLOR_MODE.dark ? JSONViewerDarkStyle : JSONViewerStyle}
          customStyle={colorMode === COLOR_MODE.dark ? darkTheme : lightTheme}
        >
          {code}
        </SyntaxHighlighter>
      </SimpleBar>
    );
  } else {
    return (
      <List
        height={390}
        itemCount={code.split(`\n`).length}
        itemSize={rowHeight}
        width="100%"
        style={{
          paddingTop: 0,
        }}
        {...rest}
      >
        {renderRow}
      </List>
    );
  }
}
