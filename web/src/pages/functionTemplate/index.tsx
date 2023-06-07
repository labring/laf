import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RepeatClockIcon,
  Search2Icon,
} from "@chakra-ui/icons";
import {
  Avatar,
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
import FileTypeIcon from "@/components/FileTypeIcon";

import SideBar from "./Mods/SideBar";

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
      function: "hello_world",
      created_at: "2023/6/6 12:00:00",
      description: "description",
      tags: ["tag1", "tag2"],
      id: 1,
    },
    {
      author: "bb2",
      title: "test1",
      avatar: "",
      number: "22",
      usedBy: "33",
      likes: "44",
      function: "hi_laf",
      created_at: "2023/6/6 12:00:00",
      description: "description",
      tags: ["tag1", "tag2"],
      id: 2,
    },
    {
      author: "cc3",
      title: "test3",
      avatar: "",
      number: "444",
      usedBy: "555",
      likes: "7777",
      function: "hello_laf",
      created_at: "2023/6/6 12:00:00",
      description: "description",
      tags: ["tag1", "tag2"],
      id: 3,
    },
    {
      author: "aa1",
      title: "登录和注册接口",
      avatar: "",
      number: "1",
      usedBy: "2",
      likes: "3",
      function: "hello_world",
      created_at: "2023/6/6 12:00:00",
      description: "description",
      tags: ["tag1", "tag2"],
      id: 4,
    },
    {
      author: "bb2",
      title: "test1",
      avatar: "",
      number: "22",
      usedBy: "33",
      likes: "44",
      function: "hi_laf",
      created_at: "2023/6/6 12:00:00",
      description: "description",
      tags: ["tag1", "tag2"],
      id: 5,
    },
    {
      author: "cc3",
      title: "test3",
      avatar: "",
      number: "444",
      usedBy: "555",
      likes: "7777",
      function: "hello_laf",
      created_at: "2023/6/6 12:00:00",
      description: "description",
      tags: ["tag1", "tag2"],
      id: 6,
    },
    {
      author: "aa1",
      title: "登录和注册接口",
      avatar: "",
      number: "1",
      usedBy: "2",
      likes: "3",
      function: "hello_world",
      created_at: "2023/6/6 12:00:00",
      description: "description",
      tags: ["tag1", "tag2"],
      id: 7,
    },
  ];

  const { t } = useTranslation();
  const [searchKey, setSearchKey] = useState("");
  const [sorting, setSorting] = useState("按时间");
  const [page, setPage] = useState(1);
  // const [total, setTotal] = useState(66);
  // const [pageSize, setPageSize] = useState(9);
  const total = 66;
  const pageSize = 9;
  const totalPage = Math.ceil(total / pageSize);

  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div className="pt-4">
      <SideBar />
      <div className="flex justify-between pb-6 pl-64">
        <InputGroup>
          <InputLeftElement children={<Search2Icon />} height={"2rem"} />
          <Input
            width={"18.75rem"}
            height={"2rem"}
            borderRadius={"6.25rem"}
            placeholder={String(t("Search"))}
            onChange={(e) => {
              setSearchKey(e.target.value);
              console.log(searchKey);
            }}
          />
        </InputGroup>
        <InputGroup className="flex items-center justify-end pr-16">
          <span className="text-lg text-grayModern-400">{t("Template.SortOrd")} </span>
          <span className="pl-2 text-lg">{sorting}</span>
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
                      setSorting(e.currentTarget.value);
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
      <div className="flex flex-wrap justify-between pl-64 pr-8">
        {data.map((item) => {
          return (
            <div className={clsx("mb-4 w-1/3")} key={item.id}>
              <div
                className="mr-8 cursor-pointer rounded-lg border-[1px] py-2"
                style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
              >
                <div
                  className="rounded-md p-2 px-4"
                  onClick={(event: any) => {
                    event?.preventDefault();
                    navigate(`/function-templates/${item.id}`);
                  }}
                >
                  <div className="flex items-center text-second">
                    <RepeatClockIcon />
                    <span className="pl-2">创建于 {item.created_at}</span>
                  </div>
                  <div className="pb-1 text-xl font-semibold">
                    <FileTypeIcon type="ts" />
                    <span className="pl-2">{item.function}</span>
                  </div>
                  <div className="pb-1 text-second">{item.description}</div>
                  <div className="flex">
                    {item.tags.map((tag) => {
                      return (
                        <div
                          key={tag}
                          className={clsx(
                            "mr-2 rounded-md p-1",
                            darkMode ? "bg-gray-600" : "bg-gray-100",
                          )}
                        >
                          {tag}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 pb-2">
                  <div className="flex items-center">
                    <Avatar name={item.author} size={"xs"} src={item.avatar} />
                    <span className="pl-2 text-second">by {item.author}</span>
                  </div>
                  <div className="flex flex-col pl-2">
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex w-full items-center justify-end pr-16 pt-4 text-lg">
        <span className="mr-4">总数：{total} </span>
        <div
          className="cursor-pointer rounded-full px-2 py-1 hover:bg-gray-100"
          onClick={() => {
            setPage(1);
          }}
        >
          <ArrowLeftIcon boxSize={2} />
        </div>
        <div className="cursor-pointer rounded-full p-1 hover:bg-gray-100">
          <ChevronLeftIcon
            onClick={() => {
              if (page === 1) return;
              setPage(page - 1);
            }}
          />
        </div>
        <span className={clsx("pl-1", page === 1 && "text-gray-400")}>{page}</span>
        <span className="px-2">/</span>
        <span className="pr-1">{totalPage}</span>
        <div className="cursor-pointer rounded-full p-1 hover:bg-gray-100">
          <ChevronRightIcon
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => {
              if (page === totalPage) return;
              setPage(page + 1);
            }}
          />
        </div>
        <div
          className="cursor-pointer rounded-full px-2 py-1 hover:bg-gray-100"
          onClick={() => {
            setPage(8);
          }}
        >
          <ArrowRightIcon boxSize={2} />
        </div>
      </div>
    </div>
  );
}
