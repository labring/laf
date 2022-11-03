/****************************
 * cloud functions index page
 ***************************/

import React from "react";
import { AttachmentIcon } from "@chakra-ui/icons";
import { Button, HStack } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";

import FunctionLayout from "@/components/Layout/Function";
import { SiderBarWidth } from "@/constants/index";

import SiderBar from "../mods/SiderBar";

import DebugPanel from "./mods/DebugPannel";
import DependecyList from "./mods/DependecePanel";
import FunctionList from "./mods/FunctionPanel";
import funcString from "./mockFuncTextString";

import useFunctionStore from "./store";

function FunctionPage() {
  const store = useFunctionStore((store) => store);

  return (
    <div className="bg-white">
      <SiderBar />

      <div className="flex  h-screen" style={{ marginLeft: SiderBarWidth }}>
        <div className=" w-1/5" style={{ borderRight: "1px solid #eee" }}>
          <FunctionList />
          <DependecyList />
        </div>
        <div className="flex flex-1 flex-col h-screen">
          <div style={{ borderBottom: "1px solid #efefef" }}>
            <div className="flex justify-between px-2">
              <HStack spacing="2">
                <AttachmentIcon />
                <span>addToto.js</span>
                <span>M</span>
              </HStack>

              <HStack spacing="4">
                <span>调用地址：https://qcphsd.api.cloudendpoint.cn/deleteCurrentTodo</span>
                <Button
                  size="sm"
                  onClick={() => {
                    console.log("发布");
                  }}
                >
                  发布
                </Button>
              </HStack>
            </div>
          </div>
          <div className="flex-1">
            <Editor height="100%" defaultLanguage="javascript" defaultValue={funcString} />
          </div>
          <div style={{ height: 300 }}>
            <DebugPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

FunctionPage.getLayout = (page: React.ReactElement) => {
  return <FunctionLayout>{page}</FunctionLayout>;
};

export default FunctionPage;
