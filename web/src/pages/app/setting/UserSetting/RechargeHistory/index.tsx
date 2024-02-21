import { useState } from "react";
import { DateRange, DayPicker, SelectRangeEventHandler } from "react-day-picker";
import { useTranslation } from "react-i18next";
import {
  Button,
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
import { es, zhCN } from "date-fns/locale";

import { CalendarIcon, ChargeIcon, FilterIcon } from "@/components/CommonIcon";
import EmptyBox from "@/components/EmptyBox";
import Pagination from "@/components/Pagination";
import { formatDate, formatPrice } from "@/utils/format";
import getPageInfo from "@/utils/getPageInfo";

import { AccountControllerGetChargeRecords } from "@/apis/v1/accounts";

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
  const { i18n, t } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const [queryData, setQueryData] = useState(DEFAULT_QUERY_DATA);
  const [selectedRange, setSelectedRange] = useState<DateRange>();

  const { data: rechargeRes, isLoading } = useQuery(["recharge", queryData], async () => {
    return AccountControllerGetChargeRecords({
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
      <div className="flex items-center space-x-2 pt-2 text-2xl">
        <ChargeIcon size={20} color={darkMode ? "#F4F6F8" : "#24282C"} />
        <p>{t("SettingPanel.RechargeHistory")}</p>
      </div>
      <div className="mt-4 rounded border">
        <TableContainer>
          <Table
            variant="striped"
            colorScheme={darkMode ? "none" : "whiteAlpha"}
            size={"sm"}
            textTransform={"none"}
          >
            <Thead>
              <Tr className={clsx("h-8", !darkMode && "bg-[#F4F6F8]")}>
                <Th className="!pr-0">
                  <span className={clsx("mr-1 font-normal", darkMode ? "" : "text-grayModern-700")}>
                    {t("OrderNumber")}
                  </span>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span className="flex items-center">
                    <span
                      className={clsx(
                        "mr-1 border-l pl-2 font-normal",
                        darkMode ? "" : "!text-grayModern-700",
                      )}
                    >
                      {t("Duration")}
                    </span>
                    <Popover>
                      <PopoverTrigger>
                        <Button variant="none" p={0} minW={0} h={0}>
                          <CalendarIcon
                            className="cursor-pointer !text-grayModern-400"
                            boxSize="14px"
                          />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent zIndex={99}>
                        <PopoverBody>
                          <DayPicker
                            mode="range"
                            locale={i18n.language === "en" ? es : zhCN}
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
                  </span>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span className="flex items-center">
                    <span
                      className={clsx(
                        "mr-1 border-l pl-2 font-normal",
                        darkMode ? "" : "!text-grayModern-700",
                      )}
                    >
                      {t("State")}
                    </span>
                    <Popover>
                      <PopoverTrigger>
                        <Button p={0} minW={0} h={0}>
                          <FilterIcon
                            className="cursor-pointer !text-grayModern-400"
                            fontSize={12}
                          />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent w={28}>
                        <PopoverBody>
                          <RadioGroup className="flex flex-col space-y-2 lowercase">
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
                  </span>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span
                    className={clsx(
                      "border-l pl-2 font-normal",
                      darkMode ? "" : "!text-grayModern-700",
                    )}
                  >
                    {t("Recharge amount")}
                  </span>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span
                    className={clsx(
                      "border-l pl-2 font-normal",
                      darkMode ? "" : "!text-grayModern-700",
                    )}
                  >
                    {t("Bonus amount")}
                  </span>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span
                    className={clsx(
                      "border-l pl-2 font-normal",
                      darkMode ? "" : "!text-grayModern-700",
                    )}
                  >
                    {t("Total payment amount")}
                  </span>
                </Th>
              </Tr>
            </Thead>
            {!isLoading && rechargeRes?.data.list && rechargeRes?.data.list.length > 0 && (
              <Tbody bg={"none"}>
                {(rechargeRes?.data?.list || []).map((item: any, index: number) => (
                  <Tr key={item._id} bg={darkMode ? "" : index % 2 === 1 ? "#FBFBFC" : "white"}>
                    <Td
                      className={clsx(
                        "font-medium",
                        darkMode ? "!border-b-grayModern-600" : "text-grayModern-900",
                      )}
                    >
                      {item._id}
                    </Td>
                    <Td
                      className={
                        darkMode
                          ? "!border-b-grayModern-600 !text-grayModern-200"
                          : "text-grayModern-600"
                      }
                    >
                      {formatDate(item.createdAt)}
                    </Td>
                    <Td
                      className={clsx(
                        darkMode ? "!border-b-grayModern-600" : "",
                        item.phase === "Paid" ? "text-primary-600" : "text-error-600",
                      )}
                    >
                      {item.phase}
                    </Td>
                    <Td
                      className={clsx(
                        "font-medium",
                        darkMode ? "!border-b-grayModern-600" : "text-grayModern-900",
                      )}
                    >
                      {item.channel === "GiftCode"
                        ? formatPrice(item.amount)
                        : formatPrice(item.amount + item.reward)}
                    </Td>
                    <Td
                      className={clsx(
                        "font-medium",
                        darkMode ? "!border-b-grayModern-600" : "text-grayModern-900",
                      )}
                    >
                      {formatPrice(item.reward)}
                    </Td>
                    <Td
                      className={clsx(
                        "font-medium",
                        darkMode ? "!border-b-grayModern-600" : "text-grayModern-900",
                      )}
                    >
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
