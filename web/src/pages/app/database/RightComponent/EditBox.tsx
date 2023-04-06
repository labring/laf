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
      className={clsx("mb-3 ml-1 flex-col rounded-xl border-2 px-4", {
        "border-lafWhite-600": !darkMode,
      })}
      style={{
        flexBasis: "412px",
        display: show ? "flex" : "none",
      }}
    >
      <div
        className={clsx("item-center mb-4 flex justify-between border-b-2 py-2", {
          "border-lafWhite-600": !darkMode,
        })}
      >
        <Text fontSize="md" className="font-semibold leading-loose">
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
