import React from "react";
import { Button, Text } from "@chakra-ui/react";
import { t } from "i18next";
const RightPanelEditBox: React.FC<{
  children?: React.ReactNode;
  className?: string;
  isLoading: boolean;
  title?: React.ReactNode | string;
  onSave: () => void;
}> = (props) => {
  const { title, isLoading, children, onSave } = props;
  return (
    <div
      className="border-2 border-lafWhite-600 flex-col ml-1 mb-3 flex rounded-xl px-4"
      style={{
        flexBasis: "421px",
      }}
    >
      <div className="flex justify-between item-center border-b-2 border-lafWhite-600 mb-4 py-2">
        <Text fontSize="md" className="leading-loose font-semibold">
          {title}
        </Text>
        <Button
          style={{ width: "56px" }}
          colorScheme="primary"
          fontSize="sm"
          size="md"
          isLoading={isLoading}
          onClick={onSave}
        >
          {t("Save")}
        </Button>
      </div>
      {children}
    </div>
  );
};

export default RightPanelEditBox;
