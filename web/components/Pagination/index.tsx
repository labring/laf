/* eslint-disable react/jsx-no-undef */
import React, { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Flex,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
  Tooltip,
} from "@chakra-ui/react";

export default function Pagination() {
  const [pageCount, setPageCount] = useState(0);
  const [canPreviousPage, setcanPreviousPage] = useState(false);
  const [canNextPage, setCanNextPage] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageOptions, setPageOptions] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  const previousPage = () => {};
  const nextPage = () => {};

  return (
    <Flex justifyContent="space-between" m={4} alignItems="center">
      <Flex>
        <Tooltip label="First Page">
          <IconButton
            onClick={() => gotoPage(0)}
            isDisabled={!canPreviousPage}
            icon={<ArrowLeftIcon h={3} w={3} />}
            mr={4}
            aria-label={""}
          />
        </Tooltip>
        <Tooltip label="Previous Page">
          <IconButton
            onClick={previousPage}
            isDisabled={!canPreviousPage}
            icon={<ChevronLeftIcon h={6} w={6} />}
            aria-label={""}
          />
        </Tooltip>
      </Flex>

      <Flex alignItems="center">
        <Text flexShrink="0" mr={8}>
          Page
          <Text fontWeight="bold" as="span">
            {pageIndex + 1}
          </Text>{" "}
          of
          <Text fontWeight="bold" as="span">
            {pageOptions.length}
          </Text>
        </Text>
        <Text flexShrink="0">Go to page:</Text>{" "}
        <NumberInput
          ml={2}
          mr={8}
          w={28}
          min={1}
          max={pageOptions.length}
          onChange={(value) => {
            const page = value ? parseInt(value, 10) - 1 : 0;
            gotoPage(page);
          }}
          defaultValue={pageIndex + 1}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Select
          w={32}
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </Select>
      </Flex>

      <Flex>
        <Tooltip label="Next Page">
          <IconButton
            onClick={nextPage}
            isDisabled={!canNextPage}
            icon={<ChevronRightIcon h={6} w={6} />}
            aria-label={""}
          />
        </Tooltip>
        <Tooltip label="Last Page">
          <IconButton
            onClick={() => gotoPage(pageCount - 1)}
            isDisabled={!canNextPage}
            icon={<ArrowRightIcon h={3} w={3} />}
            ml={4}
            aria-label={""}
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
}
function gotoPage(page: number) {
  throw new Error("Function not implemented.");
}
