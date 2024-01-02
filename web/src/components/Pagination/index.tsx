import { Button, HStack, Select, Text, Tooltip, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/CommonIcon";

export type PageValues = {
  page: number;
  pageSize: number;
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
        <Tooltip label={t("FirstPage").toString()}>
          <Button
            variant="link"
            className={clsx(
              "!h-6 !w-6 !rounded-full !p-0",
              darkMode
                ? "hover:bg-grayModern-600"
                : "bg-lafWhite-600 !text-[#262A32] hover:bg-grayModern-200",
            )}
            style={{ minWidth: "24px" }}
            isDisabled={page === 1 || maxPage === -1}
            onClick={() => {
              onChange({
                pageSize: values.pageSize,
                page: 1,
              });
            }}
          >
            <ArrowLeftIcon fontSize="12px" />
          </Button>
        </Tooltip>
        <Tooltip label={t("PreviousPage").toString()}>
          <Button
            variant="link"
            className={clsx(
              "!h-6 !w-6 !rounded-full !p-0",
              darkMode
                ? "hover:bg-grayModern-600"
                : "bg-lafWhite-600 !text-[#262A32] hover:bg-grayModern-200",
            )}
            style={{ minWidth: "24px" }}
            isDisabled={page === 1 || maxPage === -1}
            onClick={() =>
              onChange({
                pageSize: values.pageSize,
                page: page - 1,
              })
            }
          >
            <ChevronLeftIcon fontSize="12px" />
          </Button>
        </Tooltip>
        <Text className="min-w-[10px] text-center font-medium text-[#828289]">{page}</Text>
        <Text>/</Text>
        <Text className="min-w-[10px] text-center font-medium">{maxPage < 0 ? "-" : maxPage}</Text>
        <Tooltip label={t("NextPage").toString()}>
          <Button
            variant="link"
            isDisabled={maxPage === page || maxPage === -1}
            className={clsx(
              "!h-6 !w-6 !rounded-full !p-0",
              darkMode
                ? "hover:bg-grayModern-600"
                : "bg-lafWhite-600 !text-[#262A32] hover:bg-grayModern-200",
            )}
            style={{ minWidth: "24px" }}
            onClick={() => {
              onChange({
                pageSize: values.pageSize,
                page: page + 1,
              });
            }}
          >
            <ChevronRightIcon fontSize="12px" />
          </Button>
        </Tooltip>
        <Tooltip label={t("LastPage").toString()}>
          <Button
            variant="link"
            className={clsx(
              "!h-6 !w-6 !rounded-full !p-0",
              darkMode
                ? "hover:bg-grayModern-600"
                : "bg-lafWhite-600 !text-[#262A32] hover:bg-grayModern-200",
            )}
            style={{ minWidth: "24px" }}
            isDisabled={maxPage === page || maxPage === -1}
            onClick={() => {
              onChange({
                pageSize: values.pageSize,
                page: maxPage,
              });
            }}
          >
            <ArrowRightIcon fontSize="12px" />
          </Button>
        </Tooltip>
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
