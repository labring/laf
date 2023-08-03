/****************************
 * cloud functions index page
 ***************************/

import { useEffect, useRef, useState } from "react";

import Content from "@/components/Content";
import { Col, Row } from "@/components/Grid";
import Resize from "@/components/Resize";

import StatusBar from "../mods/StatusBar";

import ConsolePanel from "./mods/ConsolePanel";
import DebugPanel from "./mods/DebugPanel";
import DependencePanel from "./mods/DependencePanel";
import EditorPanel from "./mods/EditorPanel";
import FunctionPanel from "./mods/FunctionPanel";
import HeadPanel from "./mods/HeadPanel";

import useCustomSettingStore from "@/pages/customSetting";
function FunctionPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const functionPageConfig = useCustomSettingStore((store) => store.layoutInfo.functionPage);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    function handleMouseUp() {
      setShowOverlay(false);
    }
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

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
          <HeadPanel />
          <Row>
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
            <div
              onMouseDownCapture={() => {
                setShowOverlay(true);
              }}
            >
              <Resize
                type="x"
                pageId="functionPage"
                panelId="RightPanel"
                reverse
                containerRef={containerRef}
              />
            </div>
            <Col {...functionPageConfig.RightPanel}>
              <DebugPanel containerRef={containerRef} showOverlay={showOverlay} />
            </Col>
          </Row>
        </Col>
      </Row>
      <StatusBar />
    </Content>
  );
}

export default FunctionPage;
