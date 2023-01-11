/****************************
 * cloud functions database page
 ***************************/
import { useState } from "react";
import { Button } from "@chakra-ui/react";

import CollectionDataList from "./CollectionDataList";
import CollectionListPanel from "./CollectionListPanel";

function DatabasePage() {
  const [hideList, setHideList] = useState<boolean>(false);
  return (
    <>
      <div style={{ height: "calc(100% - 50px)" }}>
        <CollectionListPanel isHidden={hideList} />
        <CollectionDataList />
      </div>
      <div
        className="bg-white w-full mt-2 ml-2 pl-2 rounded-md flex justify-start items-center"
        style={{ height: "40px" }}
      >
        <Button
          size="xs"
          variant="plain"
          style={{ fontWeight: 500 }}
          onClick={() => {
            setHideList((pre) => !pre);
          }}
        >
          集合列表
        </Button>
      </div>
    </>
  );
}

export default DatabasePage;
