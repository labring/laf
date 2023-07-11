import { useEffect, useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";

import { BillingIcon, FilterIcon } from "@/components/CommonIcon";
import EmptyBox from "@/components/EmptyBox";
import Pagination from "@/components/Pagination";
import { formatDate } from "@/utils/format";
import getPageInfo from "@/utils/getPageInfo";

import { BillingControllerFindAll } from "@/apis/v1/billings";
import { APP_LIST_QUERY_KEY } from "@/pages/home";

const LIMIT_OPTIONS = [10, 20, 100, 200];
const DEFAULT_QUERY_DATA = {
  appid: [],
  startTime: "",
  endTime: "",
  page: 1,
  pageSize: 10,
  state: "",
};

const STATE_LIST = ["Pending", "Done"];

export default function BillingDetails() {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";

  const [queryData, setQueryData] = useState(DEFAULT_QUERY_DATA);
  const [appList, setAppList] = useState<any>([]);
  const [selectedAppList, setSelectedAppList] = useState<any>([]);
  const [selectedRange, setSelectedRange] = useState<DateRange>();

  const { data: billingRes, isLoading } = useQuery(["billing", queryData], async () => {
    return BillingControllerFindAll({
      ...queryData,
    });
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    const appListQuery = queryClient.getQueryData(APP_LIST_QUERY_KEY);
    setAppList((appListQuery as { data: Array<any> })?.data || []);
    setSelectedAppList(
      (appListQuery as { data: Array<any> })?.data.map((item: any) => item.appid) || [],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <BillingIcon boxSize={5} mr={3} />
        {t("SettingPanel.BillingDetails")}
      </div>
      <div className="mt-4 rounded border">
        <TableContainer>
          <Table variant="striped" colorScheme="whiteAlpha" size={"sm"}>
            <Thead>
              <Tr className={clsx("h-8", !darkMode && "bg-[#F4F6F8]")}>
                <Th className="!pr-0">
                  <span className="mr-1 font-normal !text-grayModern-700">AppId</span>
                  <Popover>
                    <PopoverTrigger>
                      <span className="cursor-pointer text-grayModern-400">
                        <FilterIcon />
                      </span>
                    </PopoverTrigger>
                    <PopoverContent zIndex={99} w={24}>
                      <PopoverBody>
                        <div className="flex flex-col">
                          {appList.map((app: any) => (
                            <div key={app.appid} className="flex items-center">
                              <input
                                type="checkbox"
                                className="mr-1"
                                checked={selectedAppList.includes(app.appid)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAppList([...selectedAppList, app.appid]);
                                  } else {
                                    setSelectedAppList(
                                      selectedAppList.filter((item: any) => item !== app.appid),
                                    );
                                  }
                                  setQueryData({
                                    ...queryData,
                                    appid: e.target.checked
                                      ? [...selectedAppList, app.appid]
                                      : selectedAppList.filter((item: any) => item !== app.appid),
                                  });
                                }}
                              />
                              <span>{app.appid}</span>
                            </div>
                          ))}
                        </div>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
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
                  <span className="border-l pl-2 font-normal !text-grayModern-700">
                    {t("SpecItem.cpu")}
                  </span>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span className="border-l pl-2 font-normal !text-grayModern-700">
                    {t("SpecItem.memory")}
                  </span>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span className="border-l pl-2 font-normal !text-grayModern-700">
                    {t("Spec.Database")}
                  </span>
                </Th>
                <Th className="!px-0 !pl-2">
                  <span className="border-l pl-2 font-normal !text-grayModern-700">
                    {t("Spec.Storage")}
                  </span>
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
                    {t("TotalAmount")}
                  </span>
                </Th>
              </Tr>
            </Thead>
            {!isLoading && billingRes?.data.list && billingRes?.data.list.length > 0 && (
              <Tbody bg={"none"}>
                {(billingRes?.data?.list || []).map((item: any, index: number) => (
                  <Tr key={item._id} bg={index % 2 === 1 ? "#FBFBFC" : "white"}>
                    <Td className="font-medium text-grayModern-900">{item.appid}</Td>
                    <Td className="text-grayModern-600">{formatDate(item.endAt)}</Td>
                    <Td className="text-grayModern-600">{item.detail?.cpu?.amount}</Td>
                    <Td className="text-grayModern-600">{item.detail?.memory?.amount}</Td>
                    <Td className="text-grayModern-600">{item.detail?.databaseCapacity?.amount}</Td>
                    <Td className="text-grayModern-600">{item.detail?.storageCapacity?.amount}</Td>
                    <Td className={item.state === "Done" ? "text-primary-600" : "text-error-600"}>
                      {item.state}
                    </Td>
                    <Td className="font-medium text-grayModern-900">￥{item.amount}</Td>
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
          {!isLoading && !(billingRes?.data.list && billingRes?.data.list.length > 0) && (
            <Center className="min-h-[360px]">
              <EmptyBox>
                <span>{t("No History")}</span>
              </EmptyBox>
            </Center>
          )}
          {!isLoading && billingRes?.data.list && billingRes?.data.list.length > 0 && (
            <div className="p-2">
              <Pagination
                options={LIMIT_OPTIONS}
                values={getPageInfo(billingRes?.data)}
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
