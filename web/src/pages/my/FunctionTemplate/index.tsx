// import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  // ArrowLeftIcon,
  // ArrowRightIcon,
  // ChevronLeftIcon,
  // ChevronRightIcon,
  RepeatClockIcon,
} from "@chakra-ui/icons";
import { Avatar, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import { DraftIcon, FileIcon, LikeIcon, UserIcon } from "@/components/CommonIcon";
import FileTypeIcon from "@/components/FileTypeIcon";

export default function FunctionTemplate() {
  const data = [
    {
      author: "aa1",
      title: "登录和注册接口",
      avatar: "",
      number: "1",
      usedBy: "2",
      likes: "3",
      function: "hello_world",
      created_at: "2023/6/6 12:00",
      updated_at: "2023/6/6 12:00",
      description: "description",
      tags: ["tag1", "tag2"],
      visibilities: "Public",
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
      created_at: "2023/6/6 12:00",
      updated_at: "2023/6/6 12:00",
      description: "description",
      tags: ["tag1", "tag2"],
      visibilities: "Public",
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
      created_at: "2023/6/6 12:00",
      updated_at: "2023/6/6 12:00",
      description: "description",
      tags: ["tag1", "tag2"],
      visibilities: "Public",
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
      created_at: "2023/6/6 12:00",
      updated_at: "2023/6/6 12:00",
      description: "description",
      tags: ["tag1", "tag2"],
      visibilities: "Private",
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
      created_at: "2023/6/6 12:00",
      updated_at: "2023/6/6 12:00",
      description: "description",
      tags: ["tag1", "tag2"],
      visibilities: "Private",
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
      created_at: "2023/6/6 12:00",
      updated_at: "2023/6/6 12:00",
      description: "description",
      tags: ["tag1", "tag2"],
      visibilities: "Private",
      id: 3,
    },
  ];
  const { t } = useTranslation();
  // const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  return (
    <div className="pt-4">
      <div className="flex flex-wrap justify-between pl-64 pr-8">
        {data.map((item) => {
          return (
            <div className={clsx("mb-4 w-1/2")} key={item.id}>
              <div
                className="mr-8 cursor-pointer rounded-lg border-[1px] py-2"
                style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                onClick={(event: any) => {
                  event?.preventDefault();
                  navigate(`/my/edit/${item.id}`);
                }}
              >
                <div className="p-2 px-4">
                  <div className="flex items-center justify-between text-second">
                    <div>
                      <RepeatClockIcon />
                      <span className="pl-2">
                        {t("Template.CreatedAt")} {item.created_at}
                      </span>
                    </div>
                    <span
                      className={clsx(
                        "px-2 font-semibold",
                        item.visibilities === "Public"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600",
                      )}
                    >
                      {item.visibilities}
                    </span>
                  </div>
                  <div className="flex items-center pb-1 text-xl font-semibold">
                    <FileTypeIcon fontSize={20} type="ts" />
                    <span className="pl-2">{item.function}</span>
                  </div>
                  <div className="pb-1 text-second">{item.description}</div>
                  <div className="flex">
                    {item.tags.map((tag) => {
                      return (
                        <div
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
                    <span className="pl-2 pr-2 text-second">
                      {t("Template.updatedAt")} {item.updated_at}
                    </span>
                    <DraftIcon />
                    <span className="pl-1 text-second">{t("Template.Draft")}</span>
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
      {/* <div className="w-full text-lg flex items-center justify-end pr-16 pt-4">
        <span className="mr-4">总数：66 </span>
        <div
          className="cursor-pointer py-1 px-2 rounded-full hover:bg-gray-100"
          onClick={() => {setPage(1)}}
        >
          <ArrowLeftIcon boxSize={2} />
        </div>
        <div className="cursor-pointer p-1 rounded-full hover:bg-gray-100">
          <ChevronLeftIcon
            onClick={() => {
              if (page === 1) return;
              setPage(page - 1)
            }}
          />
        </div>
        <span className={clsx("pl-1", page===1 && "text-gray-400")}>{page}</span>
        <span className="px-2">/</span>
        <span className="pr-1">8</span>
        <div className="cursor-pointer p-1 rounded-full hover:bg-gray-100">
          <ChevronRightIcon
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => {
              if (page === 8) return;
              setPage(page + 1)
            }}
          />
        </div>
        <div
          className="cursor-pointer py-1 px-2 rounded-full hover:bg-gray-100"
          onClick={() => { setPage(8)}}
        >
          <ArrowRightIcon boxSize={2} />
        </div>
      </div> */}
    </div>
  );
}
