/****************************
 * cloud functions index page
 ***************************/

import Content from "@/components/Content";
import { Col, Row } from "@/components/Grid";
import Resize from "@/components/Resize";

import BottomPanel from "./mods/BottomPanel";
import ConsolePanel from "./mods/ConsolePanel";
import DebugPanel from "./mods/DebugPanel";
import DependencePanel from "./mods/DependencePanel";
import EditorPanel from "./mods/EditorPanel";
import FunctionPanel from "./mods/FunctionPanel";

import useCustomSettingStore from "@/pages/customSetting";

function FunctionPage() {
  const functionPageConfig = useCustomSettingStore((store) => store.layoutInfo.functionPage);
  return (
    <Content>
      <Row className="overflow-hidden">
        <Col {...functionPageConfig.SideBar}>
          <FunctionPanel />
          <Resize type="row" pageId="functionPage" panelId="DependencePanel" reverse />
          <Row {...functionPageConfig.DependencePanel}>
            <DependencePanel />
          </Row>
        </Col>
        <Resize type="col" pageId="functionPage" panelId="SideBar" />
        <Col className="overflow-hidden">
          <Row className="overflow-hidden">
            <EditorPanel />
          </Row>
          <Resize type="row" pageId="functionPage" panelId="ConsolePanel" reverse />
          <Row {...functionPageConfig.ConsolePanel}>
            <ConsolePanel />
          </Row>
        </Col>
        <Resize type="col" pageId="functionPage" panelId="RightPanel" reverse />
        <Col {...functionPageConfig.RightPanel}>
          <DebugPanel />
        </Col>
      </Row>
      <Row {...functionPageConfig.Bottom}>
        <BottomPanel />
      </Row>
    </Content>
  );
}

export default FunctionPage;
