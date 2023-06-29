import { ReactNode } from "react";
import { Popover, PopoverBody, PopoverContent, PopoverTrigger } from "@chakra-ui/react";

import TemplateFunctionInfo from "../../FuncTemplateItem/TemplateFunctionInfo";

import { TFunctionTemplate } from "@/apis/typing";

const TemplatePopOver = (props: { children?: ReactNode; template: TFunctionTemplate }) => {
  const { children, template } = props;
  return (
    <Popover
      trigger="hover"
      isLazy
      preventOverflow
      placement="auto-start"
      strategy="absolute"
      openDelay={500}
    >
      <PopoverTrigger>
        <span>{children}</span>
      </PopoverTrigger>
      <PopoverContent
        width={528}
        height={314}
        borderRadius={12}
        boxShadow={"0px 11px 20px 0px rgba(0, 0, 0, 0.25);"}
      >
        <PopoverBody px="6" py="4">
          <TemplateFunctionInfo template={template} popover />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default TemplatePopOver;
