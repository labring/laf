import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";

import { FileIcon, LikeIcon, UserIcon } from "@/components/CommonIcon";

export default function FunctionTemplate() {
  const sortList = ["按时间", "按收藏数", "按点赞数"];

  const data = [
    {
      author: "aa1",
      title: "登录和注册接口",
      avatar: "",
      number: "1",
      usedBy: "2",
      likes: "3",
      code: "hello world",
      id: 1,
    },
    {
      author: "bb2",
      title: "test1",
      avatar: "",
      number: "22",
      usedBy: "33",
      likes: "44",
      code: "hi laf",
      id: 2,
    },
    {
      author: "cc3",
      title: "test3",
      avatar: "",
      number: "444",
      usedBy: "555",
      likes: "7777",
      code: "hello laf",
      id: 3,
    },
  ];

  const { t } = useTranslation();
  const [sortOrd, setSortOrd] = useState("按时间");
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div className="pt-4">
      <div className="flex justify-between pb-6">
        <InputGroup>
          <InputLeftElement children={<Search2Icon />} height={"2rem"} />
          <Input
            width={"18.75rem"}
            height={"2rem"}
            borderRadius={"6.25rem"}
            placeholder={String(t("Search"))}
          />
        </InputGroup>
        <InputGroup className="flex items-center justify-end pr-16">
          <span className="text-lg text-grayModern-400">{t("Template.SortOrd")} </span>
          <span className="pl-2 text-lg">{sortOrd}</span>
          <Menu>
            <MenuButton className="cursor-pointer">
              <ChevronDownIcon boxSize={6} color="gray.400" />
            </MenuButton>
            <MenuList>
              {sortList.map((item) => {
                return (
                  <MenuItem
                    key={item}
                    value={item}
                    onClick={(e) => {
                      setSortOrd(e.currentTarget.value);
                    }}
                  >
                    {item}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
        </InputGroup>
      </div>
      <div className="flex justify-between pr-16">
        {data.map((item) => {
          return (
            <div
              className="mr-[24px] h-[216px] w-[336px] cursor-pointer rounded-md border-2"
              onClick={(event: any) => {
                event?.preventDefault();
                navigate(`/funcTemplate/${item.id}`);
              }}
              key={item.id}
            >
              <div
                className={clsx(
                  "flex h-[62px] items-center rounded-t-md pl-4",
                  darkMode ? "bg-gray-700" : "bg-[#F6F7F8]",
                )}
              >
                <img src="/logo.png" alt="avatar" className="w-10" />
                <div className="flex w-full flex-col pl-2 pr-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium">{item.title}</span>
                    <div className="flex items-center text-base">
                      <span className="px-1">
                        <FileIcon /> {item.number}
                      </span>
                      <span className="px-1">
                        <UserIcon /> {item.usedBy}
                      </span>
                      <span className="px-1">
                        <LikeIcon /> {item.likes}
                      </span>
                    </div>
                  </div>
                  <span className="text-second">by {item.author}</span>
                </div>
              </div>
              <div>{item.code}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
