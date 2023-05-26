import { useState } from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  TagCloseButton,
  TagLabel,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { COLOR_MODE } from "@/constants";

export default function InputTag(props: {
  value: string[];
  onChange: (value: string[]) => any;
  tagList: any;
}) {
  const { value, onChange, tagList } = props;
  const [inputV, setInputV] = useState("");
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  const handleMenuItemClick = (tag: any) => {
    if (!value.some((x) => x === tag.tagName)) {
      onChange([...value, tag.tagName]);
    }
  };

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
        minWidth={{ base: "100px", md: "100px" }}
        placeholder={String(t("CollectionPanel.CreateTagTip"))}
        value={inputV}
        onKeyDown={(e) => handleEnter(e)}
        onChange={(e) => {
          // onChange([e.target.value]);
          setInputV(e.target.value);
        }}
      />
      <Menu placement="bottom-end">
        <MenuButton className="cursor-pointer">
          <ChevronDownIcon boxSize={8} color="gray.400" />
        </MenuButton>
        <MenuList className="mt-1 max-h-72 overflow-y-auto">
          {(tagList || []).map((tag: any) => (
            <MenuItem
              key={tag.tagName}
              onClick={() => handleMenuItemClick(tag)}
              className="p-2 text-lg"
            >
              {tag.tagName}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </div>
  );
}
