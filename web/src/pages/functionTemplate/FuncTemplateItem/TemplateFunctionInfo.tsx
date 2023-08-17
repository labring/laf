import { useState } from "react";
import { Divider, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import MonacoEditor from "../Mods/MonacoEditor";

import { TFunctionTemplate } from "@/apis/typing";

const TemplateFunctionInfo = ({
  template,
  popover = false,
}: {
  template: TFunctionTemplate;
  popover?: boolean;
}) => {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const [currentFunction, setCurrentFunction] = useState<TFunctionTemplate["items"][number]>(
    template.items[0],
  );

  return (
    <>
      {!popover && (
        <div>
          <div className="mb-2 flex justify-between">
            <div className="w-full">
              <p className="text-ellipsis pb-2 text-[24px] font-semibold">{template.name}</p>
              <p className="text-ellipsis text-second">{template.description}</p>
            </div>
          </div>
          <Divider marginY={4} variant="dashed" />
        </div>
      )}
      <div className="flex w-full overflow-auto">
        {template.items.map((item) => (
          <div
            className={clsx(
              "mr-2 cursor-pointer whitespace-nowrap rounded-md border px-8 py-1 text-[14px]",
              !darkMode && "bg-[#F6F8F9]",
              "hover:border-blue-400 hover:bg-blue-100 hover:text-blue-700",
              currentFunction?.name === item.name && "border-blue-400 bg-blue-100 text-blue-700",
              popover ? "mb-2" : "mb-4",
            )}
            onClick={() => {
              setCurrentFunction(item);
            }}
            key={item.name}
          >
            {item.name}
          </div>
        ))}
      </div>
      <div
        className="overflow-auto"
        style={{
          height: popover ? "250px" : "60vh",
        }}
      >
        <MonacoEditor
          value={currentFunction.source.code}
          colorMode={colorMode}
          readOnly={true}
          title={currentFunction.name}
          currentFunction={currentFunction}
          popover={popover}
        />
      </div>
    </>
  );
};

export default TemplateFunctionInfo;
