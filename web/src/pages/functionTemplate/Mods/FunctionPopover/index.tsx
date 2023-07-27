import { BiMessageSquareDetail } from "react-icons/bi";
import { Popover, PopoverBody, PopoverContent, PopoverTrigger } from "@chakra-ui/react";

import FileTypeIcon from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";

const FunctionPopOver = (props: { currentFunction: any }) => {
  const { currentFunction } = props;

  return (
    <Popover trigger="hover" placement="bottom-start" isLazy>
      <IconWrap>
        <PopoverTrigger>
          <span>
            <BiMessageSquareDetail />
          </span>
        </PopoverTrigger>
      </IconWrap>
      <PopoverContent width={"300px"}>
        <PopoverBody px="6" py="4">
          <div className="flex items-center">
            <span className="mb-2 pr-2 text-[20px] font-semibold">{currentFunction.name}</span>
            <FileTypeIcon type="ts" fontSize={20} />
          </div>
          <div className="truncate pb-2 text-grayIron-600">{currentFunction.desc}</div>
          <div className="flex text-grayIron-600">
            {currentFunction.methods.map((method: any) => {
              return (
                <div className="mr-1 rounded-md bg-gray-100 px-1" key={method}>
                  {method}
                </div>
              );
            })}
          </div>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default FunctionPopOver;
