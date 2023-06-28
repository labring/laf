import { ReactNode } from "react";
import { Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal } from "@chakra-ui/react";

import TemplateFunctionInfo from "../../FuncTemplateItem/TemplateFunctionInfo";

import { TFunctionTemplate } from "@/apis/typing";

const TemplatePopOver = (props: { children?: ReactNode; template: TFunctionTemplate }) => {
  const { children, template } = props;
  return (
    <Popover
      trigger="hover"
      isLazy
      preventOverflow
      offset={[80, -80]}
      placement="auto"
      strategy="fixed"
    >
      <PopoverTrigger>
        <span>{children}</span>
      </PopoverTrigger>
      <Portal appendToParentPortal>
        <PopoverContent width={761} height={561}>
          <PopoverBody px="6" py="4">
            <TemplateFunctionInfo template={template} popover />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default TemplatePopOver;
