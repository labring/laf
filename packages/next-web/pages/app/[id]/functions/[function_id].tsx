/****************************
 * cloud functions index page
 ***************************/

import Editor from "@monaco-editor/react";
import React from "react";
import FunctionLayout from "@/components/Layout/Function";
import SiderBar from "../mods/SiderBar";
import FunctionList from "./mods/FunctionList";

function FunctionPage() {
  return (
    <div className="bg-white">
      <div className=" absolute h-screen ">
        <SiderBar />
      </div>
      <div className="flex  h-screen" style={{ marginLeft: 34 }}>
        <FunctionList />
        <div className="flex flex-1 flex-col h-screen">
          <div>editor tabs</div>
          <div>
            <Editor
              height="calc(100vh - 300px)"
              defaultLanguage="javascript"
              defaultValue="// some comment"
            />
          </div>
          <div>editor footer</div>
        </div>
      </div>
    </div>
  );
}

FunctionPage.getLayout = (page: React.ReactElement) => {
  return <FunctionLayout>{page}</FunctionLayout>;
};

export default FunctionPage;
