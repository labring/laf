import { useState } from "react";
import { DateRange, DayPicker, SelectRangeEventHandler } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { CalendarIcon } from "@chakra-ui/icons";
import {
  Center,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorMode,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";

import { ChargeIcon, FilterIcon } from "@/components/CommonIcon";
import EmptyBox from "@/components/EmptyBox";
import Pagination from "@/components/Pagination";
import { formatDate, formatPrice } from "@/utils/format";
import getPageInfo from "@/utils/getPageInfo";

import { AccountControllerChargeRecord } from "@/apis/v1/accounts";

const LIMIT_OPTIONS = [10, 20, 100, 200];
const DEFAULT_QUERY_DATA = {
  id: "",
  startTime: "",
  endTime: "",
  page: 1,
  pageSize: 10,
  state: "",
};
const STATE_LIST = ["Pending", "Paid", "Failed"];

export default function RechargeHistory() {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const [queryData, setQueryData] = useState(DEFAULT_QUERY_DATA);
  const [selectedRange, setSelectedRange] = useState<DateRange>();

  const { data: rechargeRes, isLoading } = useQuery(["recharge", queryData], async () => {
    return AccountControllerChargeRecord({
      ...queryData,
    });
  });

  const handleRangeSelect: SelectRangeEventHandler = (range: DateRange | undefined) => {
    if (range) {
      setSelectedRange(range);
      setQueryData({
        ...queryData,
        startTime: formatDate(range.from),
        endTime: formatDate(range.to),
      });
    }
  };

  return (
    <div>
      <div className="flex items-center pt-2 text-2xl">
        <ChargeIcon boxSize={5} mr={3} />
        {t("SettingPanel.RechargeHistory")}
      </div>
      <div className="mt-4 rounded border">
        <TableContainer>
          <Table variant="striped" colorScheme="whiteAlpha" size={"sm"} textTransform={"none"}>
            <Thead>
              <Tr className={clsx("h-8", !darkMode && "bg-[#F4F6F8]")}>
                <Th className="!pr-0">
                  <span className="mr-1 font-normal !text-grayModern-700">{t("OrderNumber")}</span>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span className="mr-1 border-l pl-2 font-normal !text-grayModern-700">
                    {t("Duration")}
                  </span>
                  <Popover>
                    <PopoverTrigger>
                      <span className="cursor-pointer text-grayModern-400">
                        <CalendarIcon />
                      </span>
                    </PopoverTrigger>
                    <PopoverContent zIndex={99}>
                      <PopoverBody>
                        <DayPicker
                          mode="range"
                          selected={selectedRange}
                          onSelect={handleRangeSelect}
                          styles={{
                            day: {
                              transition: "all 0.2s ease-in-out",
                              borderRadius: "unset",
                            },
                          }}
                        />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span className="mr-1 border-l pl-2 font-normal !text-grayModern-700">
                    {t("State")}
                  </span>
                  <Popover>
                    <PopoverTrigger>
                      <span className="cursor-pointer text-grayModern-400">
                        <FilterIcon />
                      </span>
                    </PopoverTrigger>
                    <PopoverContent w={28}>
                      <PopoverBody>
                        <RadioGroup className="flex flex-col lowercase">
                          {STATE_LIST.map((item) => (
                            <Radio
                              key={item}
                              name="state"
                              value={item}
                              checked={queryData.state === item}
                              onChange={(e) => {
                                setQueryData({
                                  ...queryData,
                                  state: e.target.value,
                                });
                              }}
                            >
                              {item}
                            </Radio>
                          ))}
                        </RadioGroup>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span className="border-l pl-2 font-normal !text-grayModern-700">
                    {t("Recharge amount")}
                  </span>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span className="border-l pl-2 font-normal !text-grayModern-700">
                    {t("Bonus amount")}
                  </span>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span className="border-l pl-2 font-normal !text-grayModern-700">
                    {t("Total payment amount")}
                  </span>
                </Th>
              </Tr>
            </Thead>
            {!isLoading && rechargeRes?.data.list && rechargeRes?.data.list.length > 0 && (
              <Tbody bg={"none"}>
                {(rechargeRes?.data?.list || []).map((item: any, index: number) => (
                  <Tr key={item._id} bg={index % 2 === 1 ? "#FBFBFC" : "white"}>
                    <Td className="font-medium text-grayModern-900">{item._id}</Td>
                    <Td className="text-grayModern-600">{formatDate(item.createdAt)}</Td>
                    <Td className={item.phase === "Paid" ? "text-primary-600" : "text-error-600"}>
                      {item.phase}
                    </Td>
                    <Td className="font-medium text-grayModern-900">
                      {item.channel === "GiftCode"
                        ? formatPrice(item.amount)
                        : formatPrice(item.amount + item.reward)}
                    </Td>
                    <Td className="font-medium text-grayModern-900">{formatPrice(item.reward)}</Td>
                    <Td className="font-medium text-grayModern-900">
                      {item.channel === "GiftCode" ? "-" : formatPrice(item.amount)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            )}
          </Table>
          {isLoading && (
            <Center className="min-h-[360px]">
              <Spinner />
            </Center>
          )}
          {!isLoading && !(rechargeRes?.data.list && rechargeRes?.data.list.length > 0) && (
            <Center className="min-h-[360px]">
              <EmptyBox>
                <span>{t("No History")}</span>
              </EmptyBox>
            </Center>
          )}
          {!isLoading && rechargeRes?.data.list && rechargeRes?.data.list.length > 0 && (
            <div className="p-2">
              <Pagination
                options={LIMIT_OPTIONS}
                values={getPageInfo(rechargeRes?.data)}
                onChange={(values: any) => {
                  setQueryData({
                    ...queryData,
                    ...values,
                  });
                }}
              />
            </div>
          )}
        </TableContainer>
      </div>
    </div>
  );
}
