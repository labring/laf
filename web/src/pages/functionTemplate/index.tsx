import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

import EmptyBox from "@/components/EmptyBox";

import TemplateCard from "./Mods/TemplateCard/TemplateCard";
import TemplatePopOver from "./Mods/TemplatePopover/TemplatePopover";
import FuncTemplateItem from "./FuncTemplateItem";
import {
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

  const [selectedItem, setSelectedItem] = useState(
    isModal ? { text: "", value: "" } : { text: t("Template.Recommended"), value: "recommended" },
  );
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
      } else {
        setSelectedItem({ text: "", value: "" });
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
              "w-45 absolute bottom-0 ml-20 flex flex-col",
              isModal ? "top-7" : "top-16",
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
              templateList.list.map((item) => (
                <section
                  className={clsx(
                    "mb-3",
                    selectedItem.value === "all" || selectedItem.value === "recommended"
                      ? "w-1/3"
                      : "w-1/2",
                  )}
                  key={item._id}
                >
                  <TemplatePopOver template={item}>
                    <TemplateCard
                      onClick={() => {
                        const currentURL = window.location.pathname;
                        const lastIndex = currentURL.lastIndexOf("/");
                        const newURL = currentURL.substring(0, lastIndex) + `/${item._id}`;
                        navigate(newURL);
                        setSelectedItem({ text: "", value: "" });
                      }}
                      template={item}
                      templateCategory={selectedItem.value}
                    ></TemplateCard>
                  </TemplatePopOver>
                </section>
              ))
            ) : (
              <div className="w-full pt-20">
                <EmptyBox>
                  <p>{t("Template.EmptyTemplate")}</p>
                </EmptyBox>
              </div>
            )}
          </div>
          {templateList && templateList.list.length > 0 && (
            <PaginationBar
              page={page}
              setPage={setPage}
              total={templateList?.total || 0}
              pageSize={
                selectedItem.value === "all" || selectedItem.value === "recommended" ? 12 : 8
              }
            />
          )}
        </div>
      ) : (
        <FuncTemplateItem setSelectedItem={setSelectedItem} selectedItem={selectedItem} />
      )}
    </div>
  );
}
