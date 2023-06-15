import { createRef, useEffect, useRef, useState } from "react";
import { Tag, TagCloseButton, TagLabel, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { COLOR_MODE } from "@/constants";

import { LabelIcon } from "../CommonIcon";

export default function InputTag(props: {
  value: string[];
  onChange: (value: string[]) => any;
  tagList: any;
}) {
  const { value, onChange, tagList } = props;
  const [inputV, setInputV] = useState("");
  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRefs = useRef([]);
  const menuRef = useRef(null);

  useEffect(() => {
    menuRefs.current = Array((tagList || []).length).map(
      (_, index) => menuRefs.current[index] || createRef(),
    );
  }, [tagList]);

  const handleInputClick = () => {
    setIsMenuOpen(true);
  };

  const handleClickOutside = (e: any) => {
    if (menuRef.current && !(menuRef.current as HTMLElement).contains(e.target)) {
      setIsMenuOpen(false);
    }
  };

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

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={clsx("flex w-full items-center rounded-md text-lg")}>
      {value.length > 0
        ? value.map((item) => (
            <Tag className="mr-2" key={item}>
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
        className="my-1 ml-2 flex-1 border-none bg-transparent outline-none"
        placeholder={String(t("CollectionPanel.CreateTagTip"))}
        value={inputV}
        onChange={(e) => {
          setInputV(e.target.value);
          if (isMenuOpen) setIsMenuOpen(false);
        }}
        onClick={handleInputClick}
        onKeyDown={handleEnter}
      />
      {(tagList || []).length > 0 && isMenuOpen && (
        <div
          className={clsx(
            "absolute top-8 z-50 ml-6 flex w-11/12 flex-wrap rounded-md p-2 drop-shadow-md",
            darkMode ? "bg-gray-800" : "bg-white",
          )}
          ref={menuRef}
        >
          {tagList.map((tag: any, index: number) => (
            <div
              key={tag.tagName}
              ref={menuRefs.current[index]}
              onClick={() => {
                handleMenuItemClick(tag);
              }}
              className={clsx(
                "mx-2 my-2 cursor-pointer rounded-md bg-gray-100 px-2 text-lg",
                darkMode ? "bg-gray-700" : "bg-gray-100",
              )}
            >
              {tag.tagName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
