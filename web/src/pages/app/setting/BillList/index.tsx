import { useState } from "react";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { t } from "i18next";

import InfoDetail from "../AppInfoList/InfoDetail";

import { TBillItem } from "@/apis/typing";

export default function BillList() {
  const [showDetail, setShowDetail] = useState(false);
  const [currentData, setCurrentData] = useState<TBillItem>();

  const billList = [
    {
      id: "100201020120",
      name: "ttt",
      time: "2023/1/2 10:24",
      money: 1000,
      type: 0,
    },
    {
      id: "100201020121",
      name: "ttt",
      time: "2023/1/2 10:24",
      money: -1200,
      type: 1,
    },
    {
      id: "100201020123",
      name: "ttt",
      time: "2023/1/2 10:24",
      money: 1200,
      type: 0,
    },
    {
      id: "100201020129",
      name: "ttt",
      time: "2023/1/2 10:24",
      money: 1000,
      type: 0,
    },
    {
      id: "100201020128",
      name: "ttt",
      time: "2023/1/2 10:24",
      money: -1200,
      type: 1,
    },
    {
      id: "100201020127",
      name: "ttt",
      time: "2023/1/2 10:24",
      money: 1200,
      type: 0,
    },
    {
      id: "100201020130",
      name: "ttt",
      time: "2023/1/2 10:24",
      money: 1000,
      type: 0,
    },
    {
      id: "100201020131",
      name: "ttt",
      time: "2023/1/2 10:24",
      money: -1200,
      type: 1,
    },
    {
      id: "100201020133",
      name: "ttt",
      time: "2023/1/2 10:24",
      money: 1200,
      type: 0,
    },
  ];
  return (
    <div className="h-full flex flex-col items-center justify-start pb-4">
      {showDetail ? (
        <div className="w-full">
          <p className="h-[40px] flex-none text-left w-full">
            <span
              className="cursor-pointer "
              onClick={() => {
                setShowDetail(false);
              }}
            >
              <MdKeyboardArrowLeft className="inline-block" fontSize={12} />
              {t("Back")}
            </span>
          </p>
          <div className="flex-grow flex overflow-auto flex-col">
            {currentData && currentData?.money > 0 ? (
              <InfoDetail
                title={t("SettingPanel.DepositInfo")}
                leftData={[
                  { key: t("SettingPanel.DepositMethod"), value: "购买" },
                  { key: t("SettingPanel.SerialNum"), value: currentData?.id },
                  { key: t("SettingPanel.CreateTime"), value: currentData?.time },
                ]}
                rightData={[
                  { key: t("SettingPanel.Amount"), value: currentData?.money },
                  { key: t("SettingPanel.Drawee"), value: currentData?.name },
                ]}
              />
            ) : (
              <>
                <InfoDetail
                  title={t("SettingPanel.OrderInfo")}
                  leftData={[
                    { key: t("SettingPanel.Src"), value: "购买" },
                    { key: t("SettingPanel.OrderNo"), value: currentData?.id },
                    { key: t("SettingPanel.CreateTime"), value: currentData?.time },
                  ]}
                  rightData={[
                    { key: t("SettingPanel.Amount"), value: currentData?.money },
                    { key: t("SettingPanel.Drawee"), value: currentData?.name },
                  ]}
                />
                <InfoDetail
                  className="mt-6"
                  title={t("SettingPanel.AppInfo")}
                  leftData={[
                    { key: t("SettingPanel.AppName"), value: "宠物大作战" },
                    { key: "APP ID", value: "lhs33" },
                  ]}
                  rightData={[
                    { key: t("SettingPanel.AppSpec"), value: "体验版" },
                    { key: t("SettingPanel.Cycle"), value: "1个月" },
                  ]}
                />
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="w-full rounded-md  border border-frostyNightfall-200 h-full">
            <TableContainer h={"100%"} overflowY="auto">
              <Table variant="simple">
                <Thead className="bg-lafWhite-300 text-grayModern-500 ">
                  <Tr>
                    <Th>{t("SettingPanel.OrderNo")}</Th>
                    <Th>{t("SettingPanel.Drawee")}</Th>
                    <Th>{t("SettingPanel.CreateTime")}</Th>
                    <Th>{t("SettingPanel.Amount")}</Th>
                    <Th key="operation">{t("Operation")}</Th>
                  </Tr>
                </Thead>
                <Tbody className="font-mono bg-white">
                  {billList.map((item) => (
                    <Tr key={item.id}>
                      <Td>{item.id}</Td>
                      <Td>{item.name}</Td>
                      <Td>{item.time}</Td>
                      <Td>
                        {item.money > 0 ? (
                          <span className="text-primary-600">+{item.money}</span>
                        ) : (
                          <span className="text-error-600">{item.money}</span>
                        )}
                      </Td>
                      <Td
                        className="text-blue-700 cursor-pointer inline-block"
                        onClick={() => {
                          setCurrentData(item);
                          setShowDetail(true);
                        }}
                      >
                        {t("SettingPanel.ViewDetail")} &gt;
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}
    </div>
  );
}
