/****************************
 * cloud functions database page
 ***************************/
import { useState } from "react";
import { Button } from "@chakra-ui/react";

import Content from "@/components/Content";
import { Row } from "@/components/Grid";
import Panel from "@/components/Panel";

import CollectionDataList from "./CollectionDataList";
import CollectionListPanel from "./CollectionListPanel";

function DatabasePage() {
  const [hideList, setHideList] = useState<boolean>(false);
  return (
    <Content>
      <Row className="flex-grow">
        <CollectionListPanel isHidden={hideList} />

        <CollectionDataList />
      </Row>
      <Row className="!flex-none">
        <Panel className="w-full h-[40px]">
          <Panel.Header>
            <Button
              size="xs"
              variant="plain"
              onClick={() => {
                setHideList((pre) => !pre);
              }}
            >
              集合列表
            </Button>
          </Panel.Header>
        </Panel>
      </Row>
    </Content>
  );
}

export default DatabasePage;
