import { Button, HStack } from "@chakra-ui/react";
import { t } from "i18next";

import Panel from "@/components/Panel";

import useCustomSettingStore from "@/pages/customSetting";

function BottomPanel() {
  const store = useCustomSettingStore();

  return (
    <Panel className=" !flex-row justify-between">
      <HStack spacing={2}>
        <Button
          size="xs"
          variant="plain"
          onClick={() => store.togglePanel("collectionPage", "PolicyPanel")}
        >
          {t("CollectionPanel.Policy")}
        </Button>
      </HStack>
    </Panel>
  );
}

export default BottomPanel;
