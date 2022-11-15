import React from "react";
import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import Editor, { useMonaco } from "@monaco-editor/react";

function AddDataMoale() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()
  return (
    <>
      <div onClick={onOpen} className="flex items-center justify-center h-8 w-24 bg-black">
        <AddIcon color='white' /><span className="text-white">新增记录</span>
      </div>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>添加数据</DrawerHeader>
          <Editor
            theme="light"
            height="100px"
            defaultLanguage="json"
            value={`{\n\t"name":"hello"\n}`}
            options={{
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
              },
              lineNumbers: "off",
              lineNumbersMinChars: 0,
              scrollBeyondLastLine: false,
              folding: false,
              overviewRulerBorder: false,
              roundedSelection: false,

              tabSize: 2, // tab 缩进长度
            }}
          ></Editor>
          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme='blue'>Save</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default AddDataMoale;