import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text, Tooltip } from "@chakra-ui/react";

type PageValues = {
  page: number;
  limit: number;
  total?: number;
};

export default function Pagination(props: {
  values: PageValues;
  onChange: (values: PageValues) => void;
}) {
  const { values, onChange } = props;
  const { page = 1, total, limit = 10 } = values;
  const maxPage = total ? Math.ceil(total / limit) : -1;

  return (
    <Flex justifyContent="end" m={4} alignItems="center">
      <Flex>
        <Tooltip label="First Page">
          <IconButton
            onClick={() => {
              props.onChange({
                ...values,
                page: 1,
              });
            }}
            isDisabled={page === 1}
            icon={<ArrowLeftIcon h={3} w={3} />}
            mr={4}
            aria-label={""}
          />
        </Tooltip>
        <Tooltip label="Previous Page">
          <IconButton
            onClick={() =>
              onChange({
                ...values,
                page: page - 1,
              })
            }
            isDisabled={page === 1}
            icon={<ChevronLeftIcon h={6} w={6} />}
            aria-label={""}
          />
        </Tooltip>
      </Flex>

      <Flex alignItems="center">
        <Text
          fontWeight="bold"
          as="span"
          width={"40px"}
          display="inline-block"
          textAlign={"center"}
        >
          {page}
        </Text>
        /
        <Text fontWeight="bold" as="p" width={"40px"} display="inline-block" textAlign={"center"}>
          {maxPage < 0 ? "" : maxPage}
        </Text>
      </Flex>

      <Flex>
        <Tooltip label="Next Page">
          <IconButton
            isDisabled={maxPage === page}
            icon={<ChevronRightIcon h={6} w={6} />}
            aria-label={""}
            onClick={() => {
              props.onChange({
                ...values,
                page: page + 1,
              });
            }}
          />
        </Tooltip>
        <Tooltip label="Last Page">
          <IconButton
            onClick={() => {
              props.onChange({
                ...values,
                page: maxPage,
              });
            }}
            isDisabled={maxPage === page}
            icon={<ArrowRightIcon h={3} w={3} />}
            ml={4}
            aria-label={""}
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
}
