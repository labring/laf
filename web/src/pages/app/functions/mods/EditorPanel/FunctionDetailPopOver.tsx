import { BiMessageSquareDetail } from "react-icons/bi";
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Tag,
  TagLabel,
} from "@chakra-ui/react";

import FileTypeIcon from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import { formatDate } from "@/utils/format";

import useFunctionStore from "../../store";

const FunctionDetailPopOver = () => {
  const { currentFunction } = useFunctionStore();
  return (
    <Popover trigger="hover" placement="bottom-start" isLazy>
      <IconWrap>
        <PopoverTrigger>
          <span>
            <BiMessageSquareDetail />
          </span>
        </PopoverTrigger>
      </IconWrap>
      <Portal>
        <PopoverContent width={"400px"}>
          <PopoverBody px="6" py="4">
            <h2 className="mb-1 text-2xl">
              <span className="align-middle">{currentFunction.name}</span>{" "}
              <FileTypeIcon type="ts" />
            </h2>
            <div className="text-grayIron-600">
              <span>更新于 {formatDate(currentFunction.updatedAt)}</span>
              <p className="mt-2">{currentFunction.desc}</p>
            </div>
            <div className="mt-2 flex w-full flex-wrap items-center justify-start">
              {currentFunction.tags.map((item: string) => (
                <Tag className="mb-2 mr-2 cursor-pointer" key={item} variant="inputTag">
                  <TagLabel>{item}</TagLabel>
                </Tag>
              ))}
            </div>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default FunctionDetailPopOver;
