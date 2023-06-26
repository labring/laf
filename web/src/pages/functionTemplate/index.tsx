import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { AddIcon, ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
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

import { FileIcon, LikeIcon, TimeIcon } from "@/components/CommonIcon";
import EmptyBox from "@/components/EmptyBox";
import FileTypeIcon from "@/components/FileTypeIcon";
import IconWrap from "@/components/IconWrap";
import { daysAgo, formatDate } from "@/utils/format";

import {
  useDeleteFunctionTemplateMutation,
  useGetFunctionTemplatesQuery,
  useGetMyFunctionTemplatesQuery,
  useGetRecommendFunctionTemplatesQuery,
} from "./service";

import styles from "./Mods/SideBar/index.module.scss";

import { TemplateList } from "@/apis/typing";
import PaginationBar from "@/pages/functionTemplate/Mods/PaginationBar";

type queryData = {
  page: number;
  pageSize: number;
  keyword: string;
  type: string;
  asc: number;
  sort: string | null;
};

export default function FunctionTemplate() {
  const deleteFunctionMutation = useDeleteFunctionTemplateMutation();

  const { t } = useTranslation();
  const sortList = [t("Template.Latest"), t("Template.Earliest"), t("Template.MostStars")];
  const sideBar_data = [
    { text: t("Template.CommunityTemplate"), value: "all" },
    { text: t("Template.Recommended"), value: "recommended" },
    { text: t("Template.My"), value: "my" },
    { text: t("Template.StaredTemplate"), value: "stared" },
    { text: t("Template.Recent"), value: "recent" },
  ];

  const defaultQueryData: queryData = {
    page: 1,
    pageSize: 12,
    keyword: "",
    type: "default",
    asc: 1,
    sort: null,
  };

  const [selectedItem, setSelectedItem] = useState({ text: "", value: "" });
  const [queryData, setQueryData] = useState(defaultQueryData);
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
          setQueryData({ ...queryData, type: "stared" });
        } else if (foundItem.value === "recent") {
          setQueryData({ ...queryData, type: "recentUsed" });
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

  useGetRecommendFunctionTemplatesQuery(
    {
      ...queryData,
      page: page,
    },
    {
      enabled: selectedItem.value === "recommended",
      onSuccess: (data: any) => {
        setTemplateList(data.data);
      },
    },
  );

  useGetMyFunctionTemplatesQuery(
    {
      ...queryData,
      page: page,
      pageSize: 8,
    },
    {
      enabled: ["my", "stared", "recent"].includes(selectedItem.value),
      onSuccess: (data: any) => {
        setTemplateList(data.data);
      },
    },
  );

  const handleSideBarClick = (item: any) => {
    setSelectedItem(item);
    setQueryData(defaultQueryData);
    setSorting(sortList[0]);
    if (item.value === "my") {
      setQueryData(defaultQueryData);
    } else if (item.value === "stared") {
      setQueryData({ ...defaultQueryData, type: "stared" });
    } else if (item.value === "recent") {
      setQueryData({ ...defaultQueryData, type: "recentUsed" });
    }
    setPage(1);
    window.history.replaceState(
      null,
      "",
      window.location.href.replace(/\/([^/]+)\/?$/, `/${item.value}`),
    );
  };

  const handleSearch = (e: any) => {
    setQueryData({ ...defaultQueryData, keyword: e.target.value });
  };

  const handleSortListClick = (e: any) => {
    setSorting(e.currentTarget.value);
    if (e.currentTarget.value === sortList[0]) {
      setQueryData({ ...queryData, asc: 1, sort: null });
    } else if (e.currentTarget.value === sortList[1]) {
      setQueryData({ ...queryData, asc: 0, sort: null });
    } else if (e.currentTarget.value === sortList[2]) {
      setQueryData({ ...queryData, asc: 1, sort: "hot" });
    }
  };

  return (
    <div className="pt-4">
      <div className="w-45 absolute bottom-0 top-20 ml-20 flex flex-col">
        <div className={clsx(darkMode ? styles.title_dark : styles.title)}>
          {t("HomePage.NavBar.funcTemplate")}
        </div>
        {sideBar_data.map((item) => {
          return (
            <div
              key={item.value}
              className={clsx(
                styles.explore_item,
                item.value === selectedItem.value
                  ? "bg-primary-100 text-primary-600"
                  : "bg-[#F4F6F8] text-[#5A646E]",
              )}
              onClick={() => handleSideBarClick(item)}
            >
              {item.text}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between py-5 pl-72">
        {selectedItem.value === "my" ? (
          <Button
            onClick={() => {
              navigate("/market/templates/create");
            }}
            leftIcon={<AddIcon />}
            className="mr-8"
            height={"2rem"}
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
              onChange={debounce(handleSearch, 500)}
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
                    <MenuItem key={item} value={item} onClick={handleSortListClick}>
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
        {templateList && templateList.list.length > 0 ? (
          (templateList?.list).map((item) => {
            return (
              <div
                className={clsx(
                  "mb-3",
                  selectedItem.value === "all" || selectedItem.value === "recommended"
                    ? "w-1/3"
                    : "w-1/2",
                )}
                key={item._id}
              >
                <div
                  className="mr-4 cursor-pointer rounded-lg border-[1px]"
                  style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.outlineWidth = "2px";
                    e.currentTarget.style.boxShadow =
                      "0px 2px 4px rgba(0, 0, 0, 0.1), 0px 0px 0px 2px #66CBCA";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.outlineWidth = "1px";
                    e.currentTarget.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div
                    className="mx-5 pt-4"
                    onClick={(event: any) => {
                      event?.preventDefault();
                      navigate(`/market/templates/${selectedItem.value || "all"}/${item._id}`);
                    }}
                  >
                    <div className={clsx("mb-1 flex justify-between")}>
                      <div
                        className={clsx(
                          "flex items-center",
                          darkMode ? "text-gray-300" : "text-grayIron-600",
                        )}
                      >
                        <TimeIcon color={darkMode ? "gray.300" : "grayIron.500"} />
                        <span className="pl-2">
                          {t("Template.CreatedAt")} {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {selectedItem.value === "my" && (
                          <span
                            className={clsx(
                              "mr-3 px-2 font-semibold",
                              item.private === false
                                ? "bg-blue-100 text-blue-600"
                                : "bg-adora-200 text-adora-600",
                            )}
                          >
                            {item.private ? "Private" : "Public"}
                          </span>
                        )}
                        {selectedItem.value === "my" && (
                          <Menu placement="bottom-end">
                            <MenuButton
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <IconWrap>
                                <BsThreeDotsVertical size={12} />
                              </IconWrap>
                            </MenuButton>
                            <MenuList width={12} minW={24}>
                              <MenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/market/templates/${selectedItem.value}/${item._id}/edit`,
                                  );
                                }}
                              >
                                {t("Template.EditTemplate")}
                              </MenuItem>
                              <MenuItem
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await deleteFunctionMutation.mutateAsync({ id: item._id });
                                  window.location.reload();
                                }}
                              >
                                {t("Template.DeleteTemplate")}
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center pb-2 text-xl font-semibold">
                      <FileTypeIcon type="ts" fontSize={20} />
                      <div className="truncate pl-2">{item.name}</div>
                    </div>
                    <div
                      className={clsx(
                        "flex h-4 items-center truncate",
                        darkMode ? "text-gray-300" : "text-second",
                      )}
                    >
                      {item.description}
                    </div>
                  </div>

                  <div className="mx-5 my-3 flex items-center justify-between">
                    <span
                      className={clsx("pr-2", darkMode ? "text-gray-300" : "text-grayModern-500")}
                    >
                      {t("Template.updatedAt")} {daysAgo(item.updatedAt)}
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
          })
        ) : (
          <EmptyBox>
            <p>{t("Template.EmptyTemplate")}</p>
          </EmptyBox>
        )}
      </div>
      {templateList && templateList.list.length > 0 && (
        <PaginationBar
          page={page}
          setPage={setPage}
          total={templateList?.total || 0}
          pageSize={selectedItem.value === "all" ? 12 : 8}
        />
      )}
    </div>
  );
}
