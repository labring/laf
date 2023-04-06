import { Button } from "@chakra-ui/react";
import { t } from "i18next";

import JsonEditor from "@/components/Editor/JsonEditor";
export default function ColPanel() {
  return (
    <div className="group  relative h-full">
      <div className="mb-2 flex justify-end">
        <Button size={"sm"} px="5" colorScheme="primary">
          {t("Save")}
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 top-12 rounded border p-2">
        <JsonEditor value={JSON.stringify({ name: "hello" })} />
      </div>
    </div>
  );
}
