/****************************
 * cloud functions index page
 ***************************/

import Editor from "@monaco-editor/react";
import React from "react";
import FunctionLayout from "@/components/Layout/Function";
import SiderBar from "../mods/SiderBar";
import FunctionList from "./mods/FunctionList";
import { AttachmentIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";

import funcString from "./mockFuncTextString";
import DependecyList from "./mods/DependecyList";
import { SiderBarWith } from "@/constants/index";

function FunctionPage() {
  return (
    <div className="bg-white">
      <SiderBar />
      <div className="flex  h-screen" style={{ marginLeft: SiderBarWith }}>
        <div className=" w-1/5" style={{ borderRight: "1px solid #eee" }}>
          <FunctionList />
          <DependecyList />
        </div>
        <div className="flex flex-1 flex-col h-screen">
          <div>
            <div className="flex justify-between px-4">
              <div>
                <AttachmentIcon />
                addToto.js
                <span>M</span>
              </div>

              <div>
                调用地址：https://qcphsd.api.cloudendpoint.cn/deleteCurrentTodo
                <Button size="sm">发布</Button>
              </div>
            </div>
          </div>
          <div>
            <Editor
              height="calc(100vh - 300px)"
              defaultLanguage="javascript"
              defaultValue={funcString}
            />
          </div>
          <div>
            <div className="bg-slate-100">接口调试</div>
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
