import { useState } from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  TagCloseButton,
  TagLabel,
  // useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

// import { COLOR_MODE } from "@/constants";
import { LabelIcon } from "../CommonIcon";

export default function InputTag(props: {
  value: string[];
  onChange: (value: string[]) => any;
  tagList: any;
}) {
  const { value, onChange, tagList } = props;
  const [inputV, setInputV] = useState("");
  // const { colorMode } = useColorMode();
  // const darkMode = colorMode === COLOR_MODE.dark;

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
    <div className={clsx("flex w-full items-center rounded-md text-lg")}>
      {value.length > 0
        ? value.map((item) => (
            <Tag className="mr-2 bg-white" key={item}>
              <TagLabel>{item}</TagLabel>
              <TagCloseButton
                onClick={() => {
                  handleClose(item);
                }}
              />
            </Tag>
          ))
        : null}

      <LabelIcon boxSize={4} color={"#D9D9D9"} />
      <input
        className="ml-2 flex-1 border-none bg-transparent outline-none"
        placeholder={String(t("CollectionPanel.CreateTagTip"))}
        value={inputV}
        onChange={(e) => {
          // onChange([e.target.value]);
          setInputV(e.target.value);
        }}
        onKeyDown={(e) => handleEnter(e)}
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
