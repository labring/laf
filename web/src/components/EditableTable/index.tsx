import { useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import JsonEditor from "../Editor/JsonEditor";

import { TColumnItem, TConfiguration } from "./EditableTr";

// convert [{name: "SERVER_SECRET", value: "abcd"}] to {SERVER_SECRET: abcd}
const convertToEnv = (data: any[]) => {
  const env: { [key: string]: string } = {};
  data.forEach((item) => {
    env[item.name] = item.value;
  });
  return env;
};

const EditableTable = function (props: {
  column: TColumnItem[];
  tableData: any[] | undefined;
  configuration: TConfiguration;
  onEdit: (data: any) => Promise<any>;
  onDelete: (data: any) => Promise<any>;
  onCreate: (data: any) => Promise<any>;
}) {
  const { tableData = [] } = props;
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <>
      <div
        className={clsx("relative rounded border", {
          "border-frostyNightfall-200": !darkMode,
        })}
      >
        <JsonEditor value={JSON.stringify(convertToEnv(tableData), null, 2)} height="200px" />
      </div>
    </>
  );
};

export default EditableTable;
