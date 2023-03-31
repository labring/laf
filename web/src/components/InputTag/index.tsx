import { useState } from "react";
import { Input, Tag, TagCloseButton, TagLabel, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

export default function InputTag(props: { value: string[]; onChange: (value: string[]) => any }) {
  const { value, onChange } = props;
  const [inputV, setInputV] = useState("");
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  const handleEnter = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = inputV.trim().slice(0, 16);
      if (input !== "" && !value.some((x) => x === input)) {
        onChange([...value, input]);
      }
      setInputV("");
    }
  };
  const handleClose = (item: string) => {
    onChange(value.filter((name) => name !== item));
  };
  return (
    <div
      className={clsx(
        "flex items-center rounded-md p-2 ",
        darkMode ? "bg-gray-800" : "bg-gray-100",
      )}
    >
      {value.length > 0
        ? value.map((item) => (
            <Tag className="mr-2 bg-white " key={item} variant="inputTag">
              <TagLabel>{item}</TagLabel>
              <TagCloseButton
                onClick={() => {
                  handleClose(item);
                }}
              />
            </Tag>
          ))
        : null}
      <Input
        className="flex-1"
        minWidth={{ base: "150px", md: "150px" }}
        placeholder={String(t("CollectionPanel.CreateTagTip"))}
        value={inputV}
        onKeyDown={(e) => handleEnter(e)}
        onChange={(e) => {
          // onChange([e.target.value]);
          setInputV(e.target.value);
        }}
      />
    </div>
  );
}
