import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Button, Flex, Select, Text } from "@chakra-ui/react";
import { t } from "i18next";

import IconWrap from "../IconWrap";

export type PageValues = {
  page?: number;
  limit?: number;
  total?: number;
};

export default function Pagination(props: {
  values: PageValues;
  options?: number[];
  onChange: (values: PageValues) => void;
}) {
  const { values, onChange, options } = props;
  const { page, total, limit } = values;
  const maxPage = total && limit ? Math.ceil(total / limit) : -1;

  return (
    <Flex justifyContent="end" m={4} alignItems="center">
      <Flex alignItems="center">
        <Text
          fontWeight="bold"
          as="p"
          minWidth={"36px"}
          px="8px"
          display="inline-block"
          textAlign={"center"}
        >
          {t("Total")}: {total}
        </Text>
        <IconWrap showBg tooltip="First Page" size={32} className="ml-4">
          <Button
            variant="link"
            onClick={() => {
              onChange({
                ...values,
                page: 1,
              });
            }}
            isDisabled={page === 1 || maxPage === -1}
          >
            <ArrowLeftIcon h={3} w={3} />
          </Button>
        </IconWrap>
        <IconWrap showBg tooltip="Previous Page" size={32} className="ml-4">
          <Button
            variant="link"
            onClick={() =>
              onChange({
                ...values,
                page: page! - 1,
              })
            }
            isDisabled={page === 1 || maxPage === -1}
          >
            <ChevronLeftIcon h={6} w={6} />
          </Button>
        </IconWrap>
      </Flex>

      <Flex alignItems="center">
        <Text
          fontWeight="bold"
          as="span"
          minWidth={"36px"}
          px="8px"
          display="inline-block"
          textAlign={"center"}
        >
          {page}
        </Text>
        /
        <Text
          fontWeight="bold"
          as="p"
          minWidth={"36px"}
          px="8px"
          display="inline-block"
          textAlign={"center"}
        >
          {maxPage < 0 ? "-" : maxPage}
        </Text>
      </Flex>

      <Flex alignItems="center">
        <IconWrap showBg tooltip="Next Page" size={32}>
          <Button
            variant="link"
            isDisabled={maxPage === page || maxPage === -1}
            onClick={() => {
              onChange({
                ...values,
                page: page! + 1,
              });
            }}
          >
            <ChevronRightIcon h={6} w={6} />
          </Button>
        </IconWrap>
        <IconWrap showBg tooltip="Last Page" size={32} className="ml-4">
          <Button
            variant="link"
            onClick={() => {
              onChange({
                ...values,
                page: maxPage,
              });
            }}
            isDisabled={maxPage === page || maxPage === -1}
          >
            <ArrowRightIcon h={3} w={3} />
          </Button>
        </IconWrap>
        <Select
          size="sm"
          className="ml-4"
          style={{ borderWidth: 0 }}
          value={limit}
          onChange={(e: any) => {
            onChange({
              ...values,
              limit: parseInt(e.target.value),
              page: 1,
            });
          }}
        >
          {(options || [10, 20, 30]).map((data: any) => (
            <option key={data} value={data}>
              {data} / {t("Page").toString()}
            </option>
          ))}
        </Select>
      </Flex>
    </Flex>
  );
}
