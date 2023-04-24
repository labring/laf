/****************************
 * cloud functions index page
 ***************************/

import { useRef } from "react";

import Content from "@/components/Content";
import { Col, Row } from "@/components/Grid";
import Resize from "@/components/Resize";

import StatusBar from "../mods/StatusBar";

import ConsolePanel from "./mods/ConsolePanel";
import DebugPanel from "./mods/DebugPanel";
import DependencePanel from "./mods/DependencePanel";
import EditorPanel from "./mods/EditorPanel";
import FunctionPanel from "./mods/FunctionPanel";

import useCustomSettingStore from "@/pages/customSetting";
function FunctionPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const functionPageConfig = useCustomSettingStore((store) => store.layoutInfo.functionPage);
  return (
    <Content>
      <Row ref={containerRef}>
        <Col {...functionPageConfig.SideBar}>
          <FunctionPanel />
          <Resize
            type="y"
            pageId="functionPage"
            panelId="DependencePanel"
            reverse
            containerRef={containerRef}
          />
          <Row {...functionPageConfig.DependencePanel}>
            <DependencePanel />
          </Row>
        </Col>
        <Resize type="x" pageId="functionPage" panelId="SideBar" containerRef={containerRef} />
        <Col>
          <Row>
            <EditorPanel />
          </Row>
          <Resize
            type="y"
            pageId="functionPage"
            panelId="ConsolePanel"
            reverse
            containerRef={containerRef}
          />
          <Row {...functionPageConfig.ConsolePanel}>
            <ConsolePanel />
          </Row>
        </Col>
        <Resize
          type="x"
          pageId="functionPage"
          panelId="RightPanel"
          reverse
          containerRef={containerRef}
        />
        <Col {...functionPageConfig.RightPanel}>
          <DebugPanel containerRef={containerRef} />
        </Col>
      </Row>
      <StatusBar />
    </Content>
  );
}

export default FunctionPage;
