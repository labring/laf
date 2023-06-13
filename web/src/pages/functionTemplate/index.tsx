import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, RepeatClockIcon, Search2Icon } from "@chakra-ui/icons";
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
import { debounce } from "lodash";

import { FileIcon, LikeIcon } from "@/components/CommonIcon";
import FileTypeIcon from "@/components/FileTypeIcon";
import { formatDate } from "@/utils/format";

import { useGetFunctionTemplatesQuery } from "./service";

import styles from "./Mods/SideBar/index.module.scss";

import { TemplateList } from "@/apis/typing";
import PaginationBar from "@/pages/my/Mods/PaginationBar";

export default function FunctionTemplate() {
  const sortList = ["按时间最新", "按时间最早", "按收藏数最多"];
  const { t } = useTranslation();
  const [searchKey, setSearchKey] = useState("");
  const [sorting, setSorting] = useState("按时间最新");
  const [queryParams, setQueryParams] = useState<{ recent: number; starAsc: number; hot: boolean }>(
    { recent: 1, starAsc: 0, hot: false },
  );
  const [page, setPage] = useState(1);
  const [templateList, setTemplateList] = useState<TemplateList>();
  const pageSize = 15;
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  useGetFunctionTemplatesQuery(
    {
      name: searchKey,
      page: page,
      pageSize: pageSize,
      recent: queryParams.recent,
      starAsc: queryParams.starAsc,
      hot: queryParams.hot,
    },
    {
      onSuccess: (data: any) => {
        setTemplateList(data.data);
      },
    },
  );

  return (
    <div className="pt-4">
      <div className="absolute bottom-0 top-[60px] flex flex-col justify-between pl-16">
        <div className={clsx(darkMode ? styles.title_dark : styles.title)}>
          {t("market.funcTemplate")}
        </div>
      </div>
      <div className="flex justify-between pb-6 pl-64">
        <InputGroup>
          <InputLeftElement children={<Search2Icon />} height={"2rem"} />
          <Input
            width={"18.75rem"}
            height={"2rem"}
            borderRadius={"6.25rem"}
            placeholder={String(t("Search"))}
            onChange={debounce((e) => {
              setSearchKey(e.target.value);
            }, 500)}
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
                      let query_data = {};
                      if (e.currentTarget.value === "按时间最新") {
                        query_data = { recent: 1, starAsc: 0, hot: false };
                      } else if (e.currentTarget.value === "按时间最早") {
                        query_data = { recent: 0, starAsc: 0, hot: false };
                      } else if (e.currentTarget.value === "按收藏数最多") {
                        query_data = { recent: 1, starAsc: 1, hot: true };
                      }
                      setQueryParams(
                        query_data as { recent: number; starAsc: number; hot: boolean },
                      );
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
      <div className="flex flex-wrap pl-64 pr-8">
        {templateList &&
          (templateList?.list).map((item) => {
            return (
              <div className={clsx("mb-4 w-1/3")} key={item._id}>
                <div
                  className="mr-8 cursor-pointer rounded-lg border-[1px] py-2"
                  style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                >
                  <div
                    className="rounded-md p-2 px-4"
                    onClick={(event: any) => {
                      event?.preventDefault();
                      navigate(`/function-templates/${item._id}`);
                    }}
                  >
                    <div
                      className={clsx(
                        "flex items-center pb-1",
                        darkMode ? "text-gray-300" : "text-second",
                      )}
                    >
                      <RepeatClockIcon />
                      <span className="pl-2">
                        {t("Template.CreatedAt")} {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <div className="pb-2 text-xl font-semibold">
                      <FileTypeIcon type="ts" fontSize={20} />
                      <span className="pl-2">{item.name}</span>
                    </div>
                    <div className={clsx("h-4", darkMode ? "text-gray-300" : "text-second")}>
                      {item.description}
                    </div>
                    {/* <div className="flex">
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
                  </div> */}
                  </div>
                  <div className="flex items-center justify-between px-4 pb-2">
                    <div className="flex items-center">
                      {/* <Avatar name={item.author} size={"xs"} src={item.avatar} />
                    <span className="pl-2 text-second">by {item.author}</span> */}
                    </div>
                    <div className="flex flex-col pl-2">
                      <div className="flex items-center text-base">
                        <span className="px-1">
                          <FileIcon /> {item.items.length}
                        </span>
                        {/* <span className="px-1">
                        <UserIcon /> {item.usedBy}
                      </span> */}
                        <span className="px-1">
                          <LikeIcon /> {item.star}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <PaginationBar page={page} setPage={setPage} total={templateList?.total || 0} pageSize={15} />
    </div>
  );
}
