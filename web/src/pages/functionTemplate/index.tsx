import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AddIcon, ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";
import { debounce } from "lodash";

import EmptyBox from "@/components/EmptyBox";
import Pagination from "@/components/Pagination";
import { changeURL } from "@/utils/format";
import getPageInfo from "@/utils/getPageInfo";

import TemplateCard from "./Mods/TemplateCard/TemplateCard";
import FuncTemplateItem from "./FuncTemplateItem";
import {
  useGetFunctionTemplatesQuery,
  useGetMyFunctionTemplatesQuery,
  useGetRecommendFunctionTemplatesQuery,
} from "./service";

import styles from "./Mods/SideBar/index.module.scss";

import { TemplateList } from "@/apis/typing";
type queryData = {
  page: number;
  pageSize: number;
  keyword: string;
  type: string;
  asc: number;
  sort: string | null;
};

export default function FunctionTemplate(props: { isModal?: boolean }) {
  const { isModal } = props;
  const { t } = useTranslation();
  const sortList = [t("Template.MostStars"), t("Template.Latest")];
  const sideBar_data = [
    { text: t("Template.Recommended"), value: "recommended" },
    { text: t("Template.CommunityTemplate"), value: "all" },
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
    sort: "hot",
  };

  const [queryData, setQueryData] = useState(defaultQueryData);
  const setQueryDataDebounced = useMemo(
    () =>
      debounce((value) => {
        setQueryData({ ...queryData, keyword: value });
      }, 500),
    [queryData],
  );
  const [sorting, setSorting] = useState(sortList[0]);
  const [templateList, setTemplateList] = useState<TemplateList>();
  const [searchKey, setSearchKey] = useState("");

  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const getInitialSelectedItem = () => {
    const match = window.location.href.match(/\/([^/]+)\/?$/);
    if (match && match[1]) {
      const foundItem = sideBar_data.find((item) => item.value === match[1]);
      if (foundItem) {
        return foundItem;
      }
    }
    return { text: "", value: "" };
  };

  const [selectedItem, setSelectedItem] = useState(getInitialSelectedItem);

  useEffect(() => {
    const newSelectedItem = getInitialSelectedItem();
    if (newSelectedItem.value !== selectedItem.value) {
      setSelectedItem(newSelectedItem);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.href]);

  const functionTemplatesQuery = useGetFunctionTemplatesQuery(
    {
      ...queryData,
    },
    {
      enabled: selectedItem.value === "all",
      onSuccess: (data: any) => {
        setTemplateList(data.data);
      },
    },
  );

  const recommendFunctionTemplatesQuery = useGetRecommendFunctionTemplatesQuery(
    {
      ...queryData,
    },
    {
      enabled: selectedItem.value === "recommended",
      onSuccess: (data: any) => {
        setTemplateList(data.data);
      },
    },
  );

  const myFunctionTemplatesQuery = useGetMyFunctionTemplatesQuery(
    {
      ...queryData,
      pageSize: 8,
    },
    {
      enabled: ["my", "stared", "recent"].includes(selectedItem.value),
      onSuccess: (data: any) => {
        setTemplateList(data.data);
      },
    },
  );

  function getLoadingStatus(selectedValue: any, queryMapping: any) {
    const defaultLoadingStatus = false;
    return queryMapping[selectedValue]?.isLoading ?? defaultLoadingStatus;
  }

  const queryMapping = {
    all: functionTemplatesQuery,
    recommended: recommendFunctionTemplatesQuery,
    my: myFunctionTemplatesQuery,
    stared: myFunctionTemplatesQuery,
    recent: myFunctionTemplatesQuery,
  };

  let isLoading = getLoadingStatus(selectedItem.value, queryMapping);

  const handleSideBarClick = (item: any) => {
    setSelectedItem(item);
    setSorting(sortList[0]);
    setSearchKey("");
    if (item.value === "stared") {
      setQueryData({ ...defaultQueryData, type: "stared" });
    } else if (item.value === "recent") {
      setQueryData({ ...defaultQueryData, type: "recentUsed" });
    } else {
      setQueryData(defaultQueryData);
    }
    window.history.replaceState(
      null,
      "",
      window.location.href.replace(/\/([^/]+)\/?$/, `/${item.value}`),
    );
  };

  const handleSortListClick = (e: any) => {
    setSorting(e.currentTarget.value);
    if (e.currentTarget.value === sortList[1]) {
      setQueryData({ ...queryData, asc: 1, sort: null });
    } else if (e.currentTarget.value === sortList[0]) {
      setQueryData({ ...queryData, asc: 1, sort: "hot" });
    }
  };

  return (
    <div className="pt-4">
      {selectedItem.value ? (
        <div>
          <div
            className={clsx(
              "w-45 absolute bottom-0 flex flex-col",
              isModal ? "top-12" : "top-16 ml-20",
            )}
          >
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
                      : !darkMode && "text-[#5A646E]",
                  )}
                  onClick={() => handleSideBarClick(item)}
                >
                  {item.text}
                </div>
              );
            })}
          </div>
          <div
            className={clsx("flex items-center justify-between py-5", isModal ? "pl-52" : "pl-72")}
          >
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
            <div className="flex w-full">
              {selectedItem.value === "all" || selectedItem.value === "recommended" ? (
                <InputGroup className="flex">
                  <InputLeftElement children={<Search2Icon />} height={"2.5rem"} />
                  <Input
                    className="flex-1"
                    width={"100%"}
                    height={"2.5rem"}
                    borderRadius={"6.25rem"}
                    placeholder={String(t("Search"))}
                    onChange={(e) => setSearchKey(e.target.value)}
                    border={"1px solid #DEE0E2"}
                    value={searchKey || ""}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setQueryData({ ...queryData, keyword: searchKey });
                      }
                    }}
                  />
                  <InputRightElement width={"5.1rem"}>
                    <Button
                      className="!h-9"
                      onClick={() => {
                        setQueryData({ ...queryData, keyword: searchKey });
                      }}
                    >
                      {t("Search")}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              ) : (
                <InputGroup>
                  <InputLeftElement children={<Search2Icon />} height={"2rem"} />
                  <Input
                    width={"18.75rem"}
                    height={"2rem"}
                    borderRadius={"6.25rem"}
                    placeholder={String(t("Search"))}
                    onChange={(e) => {
                      setSearchKey(e.target.value);
                      setQueryDataDebounced(e.target.value);
                    }}
                    value={searchKey || ""}
                  />
                </InputGroup>
              )}
              <div className={clsx("flex items-center justify-end pl-4", isModal ? "" : "pr-16")}>
                <span className="whitespace-nowrap text-lg text-grayModern-400">
                  {t("Template.SortOrd")}{" "}
                </span>
                <Menu>
                  <MenuButton className="flex cursor-pointer">
                    <span className="whitespace-nowrap pl-2 text-lg">
                      {sorting}
                      <ChevronDownIcon boxSize={6} color="gray.400" />
                    </span>
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
              </div>
            </div>
          </div>
          <div className={isModal ? "pl-52" : "pl-72 pr-8"}>
            {isLoading ? (
              <Center className="w-full pt-36">
                <Spinner />
              </Center>
            ) : templateList && templateList.list.length > 0 ? (
              <>
                <div className="flex flex-wrap">
                  {templateList.list.map((item) => (
                    <section
                      className={clsx(
                        "mb-3 min-w-[18rem]",
                        selectedItem.value === "all" || selectedItem.value === "recommended"
                          ? "w-1/3"
                          : "w-1/2",
                      )}
                      key={item._id}
                    >
                      <TemplateCard
                        onClick={() => {
                          navigate(changeURL(`/${item._id}`));
                          setSelectedItem({ text: "", value: "" });
                        }}
                        template={item}
                        templateCategory={selectedItem.value}
                      />
                    </section>
                  ))}
                </div>
                <div className="pb-6 pt-2">
                  <Pagination
                    values={getPageInfo(templateList)}
                    onChange={(values) => {
                      setQueryData({ ...queryData, ...values });
                    }}
                    notShowSelect
                  />
                </div>
              </>
            ) : (
              <div className="w-full pt-20">
                <EmptyBox>
                  <p>{t("Template.EmptyTemplate")}</p>
                </EmptyBox>
              </div>
            )}
          </div>
        </div>
      ) : (
        <FuncTemplateItem isModal={isModal!} />
      )}
    </div>
  );
}
