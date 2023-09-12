import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AddIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Tab,
  TabIndicator,
  TabList,
  Tabs,
} from "@chakra-ui/react";

import EmptyBox from "@/components/EmptyBox";
import Pagination from "@/components/Pagination";
import getPageInfo from "@/utils/getPageInfo";

import TemplateCard from "../Mods/TemplateCard";
import { useGetMyFunctionTemplatesQuery } from "../service";
import useTemplateStore from "../store";

import { TFunctionTemplate } from "@/apis/typing";

export default function MyTemplateList() {
  const { t } = useTranslation();
  const [searchKey, setSearchKey] = useState("");
  const { myTemplateType, setMyTemplateType } = useTemplateStore();
  const [queryData, setQueryData] = useState({
    page: 1,
    pageSize: 8,
    keyword: "",
    type: myTemplateType,
    asc: 1,
    sort: "hot",
  });
  const [templateList, setTemplateList] = useState<any>([]);
  const navigate = useNavigate();

  const TABS = [
    { label: t("Template.StaredTemplate"), value: "stared" },
    { label: t("Template.Recent"), value: "recentUsed" },
    { label: t("Template.Created"), value: "default" },
  ];

  const { isLoading } = useGetMyFunctionTemplatesQuery(
    {
      ...queryData,
    },
    {
      onSuccess: (data: any) => {
        setTemplateList(data.data);
      },
    },
  );

  useEffect(() => {
    setQueryData({ ...queryData, type: myTemplateType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myTemplateType]);

  return (
    <div className="flex flex-grow flex-col">
      <div className="flex justify-between pr-4">
        <Tabs
          variant="unstyled"
          onChange={(e) => {
            setMyTemplateType(TABS[e].value);
          }}
          index={TABS.findIndex((item) => item.value === myTemplateType)}
        >
          <TabList>
            {TABS.map((item) => (
              <Tab key={item.value} className="mr-8 !px-0">
                {item.label}
              </Tab>
            ))}
          </TabList>
          <TabIndicator mt="-1.5px" height="2px" bg="primary.600" />
        </Tabs>
        <div className="flex w-[455px] items-center">
          <InputGroup>
            <InputLeftElement children={<Search2Icon />} height="8" />
            <Input
              className="!h-8 !rounded-full !border-grayModern-200"
              placeholder={String(t("Search"))}
              onChange={(e) => {
                setSearchKey(e.target.value);
              }}
              value={searchKey || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setQueryData({ ...queryData, keyword: searchKey });
                }
              }}
            />
          </InputGroup>
          <Button
            onClick={() => {
              navigate("/market/templates/create");
            }}
            leftIcon={<AddIcon />}
            className="ml-4 !h-9 !px-8"
          >
            {t("Template.CreateTemplate")}
          </Button>
        </div>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <Center className="min-h-[400px]">
            <span>
              <Spinner />
            </span>
          </Center>
        ) : templateList && templateList.list?.length > 0 ? (
          <>
            <div className="flex w-full flex-wrap">
              {templateList.list.map((item: TFunctionTemplate) => (
                <TemplateCard
                  className="mb-3 w-1/2"
                  templateCategory={queryData.type}
                  template={item}
                  key={item._id}
                />
              ))}
            </div>
            <div className="pb-6 pr-4 pt-2">
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
  );
}
