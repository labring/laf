import { Button, HStack, Select, Text, useColorMode } from "@chakra-ui/react";
import { t } from "i18next";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/CommonIcon";

import IconWrap from "../IconWrap";

export type PageValues = {
  page?: number;
  pageSize?: number;
  limit?: number;
  total?: number;
};

export default function Pagination(props: {
  values: PageValues;
  options?: number[];
  onChange: (values: PageValues) => void;
  notShowSelect?: boolean;
}) {
  const { values, onChange, options, notShowSelect } = props;
  const { page, total, pageSize } = values;
  const maxPage = total && pageSize ? Math.ceil(total / pageSize) : -1;
  const darkMode = useColorMode().colorMode === "dark";

  if (maxPage > 0 && page && page > maxPage) {
    onChange({
      pageSize: values.pageSize,
      page: maxPage,
    });
  } else if (page && page < 1) {
    onChange({
      pageSize: values.pageSize,
      page: 1,
    });
  }

  return (
    <HStack
      alignItems="center"
      spacing={"1"}
      display="flex"
      whiteSpace={"nowrap"}
      justifyContent={!notShowSelect ? "space-between" : "flex-end"}
    >
      <HStack spacing="2" className="mr-4">
        <Text as="div" className="mr-4">
          {t("Total")}: {total}
        </Text>
        <IconWrap
          showBg
          tooltip={t("FirstPage").toString()}
          size={24}
          onClick={() => {
            onChange({
              pageSize: values.pageSize,
              page: 1,
            });
          }}
        >
          <Button
            variant="link"
            className={darkMode ? "" : "!text-[#262A32]"}
            isDisabled={page === 1 || maxPage === -1}
          >
            <ArrowLeftIcon fontSize="12px" />
          </Button>
        </IconWrap>
        <IconWrap
          showBg
          tooltip={t("PreviousPage").toString()}
          size={24}
          onClick={() =>
            onChange({
              pageSize: values.pageSize,
              page: page! - 1,
            })
          }
        >
          <Button
            variant="link"
            className={darkMode ? "" : "!text-[#262A32]"}
            isDisabled={page === 1 || maxPage === -1}
          >
            <ChevronLeftIcon fontSize="12px" />
          </Button>
        </IconWrap>
        <Text className="min-w-[10px] text-center font-medium text-[#828289]">{page}</Text>
        <Text>/</Text>
        <Text className="min-w-[10px] text-center font-medium">{maxPage < 0 ? "-" : maxPage}</Text>
        <IconWrap
          showBg
          tooltip={t("NextPage").toString()}
          size={24}
          onClick={() => {
            onChange({
              pageSize: values.pageSize,
              page: page! + 1,
            });
          }}
        >
          <Button
            variant="link"
            isDisabled={maxPage === page || maxPage === -1}
            className={darkMode ? "" : "!text-[#262A32]"}
          >
            <ChevronRightIcon fontSize="12px" />
          </Button>
        </IconWrap>
        <IconWrap
          showBg
          tooltip={t("LastPage").toString()}
          onClick={() => {
            onChange({
              pageSize: values.pageSize,
              page: maxPage,
            });
          }}
          size={24}
        >
          <Button
            variant="link"
            className={darkMode ? "" : "!text-[#262A32]"}
            isDisabled={maxPage === page || maxPage === -1}
          >
            <ArrowRightIcon fontSize="12px" />
          </Button>
        </IconWrap>
      </HStack>
      {!notShowSelect && (
        <Select
          className="flex !h-8 cursor-pointer justify-center !pl-3 !text-base hover:!bg-grayModern-100/50"
          width="92px"
          value={pageSize}
          onChange={(e: any) => {
            onChange({
              pageSize: parseInt(e.target.value),
              page: 1,
            });
          }}
          variant="unstyled"
        >
          {(options || [10, 20, 30]).map((data: any) => (
            <option key={data} value={data}>
              {data} / {t("Page")}
            </option>
          ))}
        </Select>
      )}
    </HStack>
  );
}
