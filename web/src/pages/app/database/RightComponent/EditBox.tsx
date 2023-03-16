import React from "react";
import { Button, Text, useColorMode } from "@chakra-ui/react";
import { clsx } from "clsx";
import { t } from "i18next";

const RightPanelEditBox: React.FC<{
  show?: boolean;
  children?: React.ReactNode;
  className?: string;
  isLoading: boolean;
  title?: React.ReactNode | string;
  onSave: () => void;
}> = (props) => {
  const { title, isLoading, children, onSave, show } = props;
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div
      className={clsx("border-2 flex-col ml-1 mb-3 rounded-xl px-4", {
        "border-lafWhite-600": !darkMode,
      })}
      style={{
        flexBasis: "412px",
        display: show ? "flex" : "none",
      }}
    >
      <div
        className={clsx("flex justify-between item-center border-b-2 mb-4 py-2", {
          "border-lafWhite-600": !darkMode,
        })}
      >
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
