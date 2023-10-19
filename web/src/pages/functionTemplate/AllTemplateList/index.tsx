import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";

import EmptyBox from "@/components/EmptyBox";
import Pagination from "@/components/Pagination";
import getPageInfo from "@/utils/getPageInfo";

import TemplateCard from "../Mods/TemplateCard";
import { useGetFunctionTemplatesQuery } from "../service";
import useTemplateStore from "../store";

import { TFunctionTemplate } from "@/apis/typing";

type TemplateList = {
  list: TFunctionTemplate[];
  page: number;
  pageSize: number;
  total: number;
};

export default function AllTemplateList() {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage, currentSearchKey, setCurrentSearchKey } = useTemplateStore();
  const [searchKey, setSearchKey] = useState(currentSearchKey);
  const [templateList, setTemplateList] = useState<TemplateList>();
  const darkMode = useColorMode().colorMode === "dark";

  const { isLoading } = useGetFunctionTemplatesQuery(
    {
      pageSize: 12,
      type: "",
      asc: 1,
      sort: "hot",
      page: currentPage,
      keyword: currentSearchKey,
    },
    {
      onSuccess: (data: any) => {
        setTemplateList(data.data);
      },
    },
  );

  return (
    <div className="flex flex-grow flex-col">
      <div className="mr-4">
        <InputGroup>
          <InputLeftElement children={<Search2Icon />} />
          <Input
            className={clsx(
              "!rounded-full",
              darkMode ? "!border-grayModern-800" : "!border-[#DEE0E2] !bg-lafWhite-400",
            )}
            placeholder={String(t("Search"))}
            onChange={(e) => setSearchKey(e.target.value)}
            value={searchKey}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCurrentSearchKey(searchKey);
                setCurrentPage(1);
              }
            }}
          />
          <InputRightElement className="!w-24">
            <Button
              className="mr-[3px] !h-9 w-full !bg-primary-600"
              onClick={() => {
                setCurrentSearchKey(searchKey);
                setCurrentPage(1);
              }}
            >
              {t("Search")}
            </Button>
          </InputRightElement>
        </InputGroup>
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
                <section className="mb-3 w-1/3" key={item._id}>
                  <TemplateCard className="w-full" template={item} />
                </section>
              ))}
            </div>
            <div className="pb-6 pr-4 pt-2">
              <Pagination
                values={getPageInfo(templateList)}
                onChange={(values) => {
                  setCurrentPage(values.page || 1);
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
