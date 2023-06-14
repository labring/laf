import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AddIcon, ChevronDownIcon, RepeatClockIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Button,
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

import { useGetFunctionTemplatesQuery, useGetMyFunctionTemplatesQuery } from "./service";

import styles from "./Mods/SideBar/index.module.scss";

import { TemplateList } from "@/apis/typing";
import PaginationBar from "@/pages/functionTemplate/Mods/PaginationBar";

export default function FunctionTemplate() {
  const { t } = useTranslation();
  const sortList = [t("Template.Latest"), t("Template.Earliest"), t("Template.MostStars")];
  const sideBar_data = [
    { text: t("Template.Community"), value: "all" },
    { text: t("Template.My"), value: "my" },
    { text: t("Template.StaredTemplate"), value: "stared" },
    { text: t("Template.Recent"), value: "recent" },
  ];
  const [selectedItem, setSelectedItem] = useState(sideBar_data[0]);

  const defaultQueryData = {
    page: 1,
    pageSize: 12,
    name: "",
    recent: 1,
    starAsc: 1,
    hot: false,
  };
  const defaultExpendData = {
    stared: false,
    recentUsed: false,
    starName: "",
  };

  const [queryData, setQueryData] = useState(defaultQueryData);
  const [expendData, setExpendData] = useState(defaultExpendData);

  const [sorting, setSorting] = useState(sortList[0]);
  const [page, setPage] = useState(1);
  const [templateList, setTemplateList] = useState<TemplateList>();

  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  useEffect(() => {
    const match = window.location.href.match(/\/([^/]+)\/?$/);
    if (match && match[1]) {
      const foundItem = sideBar_data.find((item) => item.value === match[1]);
      if (foundItem) {
        setSelectedItem(foundItem);
        if (foundItem.value === "stared") {
          setExpendData({ ...expendData, stared: true, recentUsed: false });
        } else if (foundItem.value === "recent") {
          setExpendData({ ...expendData, stared: false, recentUsed: true });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGetFunctionTemplatesQuery(
    {
      ...queryData,
      page: page,
    },
    {
      enabled: selectedItem.value === "all",
      onSuccess: (data: any) => {
        setTemplateList(data.data);
      },
    },
  );

  useGetMyFunctionTemplatesQuery(
    {
      ...queryData,
      page: page,
      ...expendData,
    },
    {
      enabled: selectedItem.value !== "all",
      onSuccess: (data: any) => {
        setTemplateList(data.data);
      },
    },
  );

  return (
    <div className="pt-4">
      <div className="w-45 absolute bottom-0 top-20 ml-20 flex flex-col">
        <div className={clsx(darkMode ? styles.title_dark : styles.title)}>
          {t("market.funcTemplate")}
        </div>
        {sideBar_data.map((item) => {
          return (
            <div
              key={item.value}
              className={clsx(
                styles.explore_item,
                item.value === selectedItem.value
                  ? "bg-primary-200 text-primary-700"
                  : "bg-[#F4F6F8] text-[#5A646E]",
              )}
              onClick={() => {
                setSelectedItem(item);
                setQueryData(defaultQueryData);
                setSorting(sortList[0]);
                if (item.value === "my") {
                  setExpendData({ ...expendData, stared: false, recentUsed: false });
                  setPage(1);
                } else if (item.value === "stared") {
                  setExpendData({ ...expendData, stared: true, recentUsed: false });
                  setPage(1);
                } else if (item.value === "recent") {
                  setExpendData({ ...expendData, stared: false, recentUsed: true });
                  setPage(1);
                }
                window.history.replaceState(
                  null,
                  "",
                  window.location.href.replace(/\/([^/]+)\/?$/, `/${item.value}`),
                );
              }}
            >
              {item.text}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between py-5 pl-72">
        {selectedItem.value === "my" ? (
          <Button
            padding={5}
            onClick={() => {
              navigate("/function-templates/create");
            }}
            leftIcon={<AddIcon />}
            className="mr-8"
          >
            {t("Template.CreateTemplate")}
          </Button>
        ) : null}
        <div className="flex flex-1">
          <InputGroup>
            <InputLeftElement children={<Search2Icon />} height={"2rem"} />
            <Input
              width={"18.75rem"}
              height={"2rem"}
              borderRadius={"6.25rem"}
              placeholder={String(t("Search"))}
              onChange={debounce((e) => {
                setQueryData({ ...queryData, name: e.target.value });
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
                        if (e.currentTarget.value === sortList[0]) {
                          setQueryData({ ...defaultQueryData, recent: 1 });
                        } else if (e.currentTarget.value === sortList[1]) {
                          setQueryData({ ...defaultQueryData, recent: 0 });
                        } else if (e.currentTarget.value === sortList[2]) {
                          setQueryData({ ...defaultQueryData, hot: true });
                        }
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
      </div>

      <div className="flex flex-wrap pl-72 pr-8">
        {templateList &&
          (templateList?.list).map((item) => {
            return (
              <div className={clsx("mb-4 w-1/3")} key={item._id}>
                <div
                  className="mr-6 cursor-pointer rounded-lg border-[1px]"
                  style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                >
                  <div
                    className="mb-3 rounded-md px-5 pt-4"
                    onClick={(event: any) => {
                      event?.preventDefault();
                      navigate(`/function-templates/${selectedItem.value}/${item._id}`);
                    }}
                  >
                    <div className="flex justify-between">
                      <div
                        className={clsx(
                          "flex items-center pb-1.5",
                          darkMode ? "text-gray-300" : "text-second",
                        )}
                      >
                        <RepeatClockIcon />
                        <span className="pl-2">
                          {t("Template.CreatedAt")} {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <span
                        className={clsx(
                          "p-1 px-2 font-semibold",
                          item.private === false
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600",
                        )}
                      >
                        {item.private ? "Private" : "Public"}
                      </span>
                    </div>
                    <div className="flex pb-3 text-xl font-semibold ">
                      <FileTypeIcon type="ts" fontSize={20} />
                      <div className="truncate pl-2">{item.name}</div>
                    </div>
                    <div
                      className={clsx("h-4 truncate", darkMode ? "text-gray-300" : "text-second")}
                    >
                      {item.description}
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-5 pb-4">
                    <span className={clsx("pr-2", darkMode ? "text-gray-300" : "text-second")}>
                      {t("Template.updatedAt")} {formatDate(item.updatedAt)}
                    </span>
                    <div className="flex text-base">
                      <span className="pl-2">
                        <FileIcon /> {item.items.length}
                      </span>
                      <span className="pl-2">
                        <LikeIcon /> {item.star}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <PaginationBar page={page} setPage={setPage} total={templateList?.total || 0} pageSize={12} />
    </div>
  );
}
