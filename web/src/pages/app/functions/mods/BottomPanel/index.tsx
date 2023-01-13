import { Button, HStack } from "@chakra-ui/react";

import Panel from "@/components/Panel";

import useCustomSettingStore from "@/pages/customSetting";

function BottomPanel() {
  const store = useCustomSettingStore();

  return (
    <Panel className=" justify-between !flex-row">
      <HStack spacing={2}>
        <Button
          size="xs"
          variant="plain"
          onClick={() => store.togglePanel("functionPage", "DependencePanel")}
        >
          NPM 依赖
        </Button>
        <Button
          size="xs"
          variant="plain"
          onClick={() => store.togglePanel("functionPage", "ConsolePanel")}
        >
          Console
        </Button>
      </HStack>
      <HStack spacing={2}>
        <Button
          size="xs"
          variant="plain"
          onClick={() => store.togglePanel("functionPage", "RightPanel")}
        >
          接口调试
        </Button>
      </HStack>
    </Panel>
  );
}

export default BottomPanel;
