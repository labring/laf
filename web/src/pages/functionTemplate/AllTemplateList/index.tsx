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
} from "@chakra-ui/react";

import EmptyBox from "@/components/EmptyBox";
import Pagination from "@/components/Pagination";
import getPageInfo from "@/utils/getPageInfo";

import TemplateCard from "../Mods/TemplateCard";
import { useGetFunctionTemplatesQuery } from "../service";

import { TFunctionTemplate } from "@/apis/typing";

export default function AllTemplateList() {
  const { t } = useTranslation();
  const [searchKey, setSearchKey] = useState("");
  const [templateList, setTemplateList] = useState<any>([]);
  const [queryData, setQueryData] = useState<any>({
    page: 1,
    pageSize: 12,
    keyword: "",
    type: "",
    asc: 1,
    sort: "hot",
  });

  const { isLoading } = useGetFunctionTemplatesQuery(
    {
      ...queryData,
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
            className="!rounded-full !border-[#DEE0E2]"
            placeholder={String(t("Search"))}
            onChange={(e) => setSearchKey(e.target.value)}
            value={searchKey || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setQueryData({ ...queryData, keyword: searchKey });
              }
            }}
          />
          <InputRightElement className="!w-24">
            <Button
              className="mr-1 !h-9 w-full !bg-primary-600"
              onClick={() => {
                setQueryData({ ...queryData, keyword: searchKey });
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
