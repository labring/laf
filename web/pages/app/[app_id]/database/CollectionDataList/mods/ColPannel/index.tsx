import { Button } from "@chakra-ui/react";

import JsonEditor from "@/components/Editor/JsonEditor";
export default function ColPannel() {
  return (
    <div className="h-full  relative group">
      <div className="mb-2 justify-end flex">
        <Button size={"sm"} px="5" colorScheme="primary">
          保存
        </Button>
      </div>
      <div className="border p-2 rounded absolute top-12 bottom-0 left-0 right-0">
        <JsonEditor value={{ name: "hello" }} />
      </div>
    </div>
  );
}
