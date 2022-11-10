import { Icon } from "@chakra-ui/icons";
import React from "react";
import { SiJavascript } from "react-icons/si";

export const FileType = {
  js: "js",
  ts: "ts",
  json: "json",
  html: "html",
  css: "css",
  png: "png",
  jpg: "jpg",
  jpeg: "jpeg",
  gif: "gif",
  svg: "svg",
  txt: "txt",
  md: "md",
  pdf: "pdf",
  doc: "doc",
  docx: "docx",
  xls: "xls",
  xlsx: "xlsx",
  ppt: "ppt",
  pptx: "pptx",
  zip: "zip",
  rar: "rar",
  tar: "tar",
  folder: "folder",
  npm: "npm",
};

export default function FileTypeIcon(props: { type: string }) {
  const { type } = props;

  switch (type) {
    case FileType.js:
      return (
        <Icon viewBox="0 0 46 46" fontSize={20} className="align-middle">
          <path fill="#ffd600" d="M6,42V6h36v36H6z"></path>
          <path
            fill="#000001"
            d="M29.538 32.947c.692 1.124 1.444 2.201 3.037 2.201 1.338 0 2.04-.665 2.04-1.585 0-1.101-.726-1.492-2.198-2.133l-.807-.344c-2.329-.988-3.878-2.226-3.878-4.841 0-2.41 1.845-4.244 4.728-4.244 2.053 0 3.528.711 4.592 2.573l-2.514 1.607c-.553-.988-1.151-1.377-2.078-1.377-.946 0-1.545.597-1.545 1.377 0 .964.6 1.354 1.985 1.951l.807.344C36.452 29.645 38 30.839 38 33.523 38 36.415 35.716 38 32.65 38c-2.999 0-4.702-1.505-5.65-3.368L29.538 32.947zM17.952 33.029c.506.906 1.275 1.603 2.381 1.603 1.058 0 1.667-.418 1.667-2.043V22h3.333v11.101c0 3.367-1.953 4.899-4.805 4.899-2.577 0-4.437-1.746-5.195-3.368L17.952 33.029z"
          ></path>
        </Icon>
      );

    case FileType.npm:
      return (
        <Icon viewBox="0 0 32 12" fontSize={22} className="align-middle">
          <path
            d="M16 7.11111H14.2222V3.55556H16V7.11111ZM32 0V10.6667H16V12.4444H8.88889V10.6667H0V0H32ZM8.88889 1.77778H1.77778V8.88889H5.33333V3.55556H7.11111V8.88889H8.88889V1.77778ZM17.7778 1.77778H10.6667V10.6667H14.2222V8.88889H17.7778V1.77778ZM30.2222 1.77778H19.5556V8.88889H23.1111V3.55556H24.8889V8.88889H26.6667V3.55556H28.4444V8.88889H30.2222V1.77778Z"
            fill="#CB3837"
          />
        </Icon>
      );

    default:
      break;
  }

  return <div>FileTypeIcon</div>;
}
