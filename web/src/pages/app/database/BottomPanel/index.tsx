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
          onClick={() => store.togglePanel("collectionPage", "SideBar")}
        >
          集合列表
        </Button>
      </HStack>
    </Panel>
  );
}

export default BottomPanel;
