import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HStack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import ChargeButton from "@/components/ChargeButton";
import Pagination from "@/components/Pagination";
import { formatDate } from "@/utils/format";
import getPageInfo from "@/utils/getPageInfo";

import { BillingControllerFindAll } from "@/apis/v1/billings";
import { useAccountQuery } from "@/pages/home/service";

const LIMIT_OPTIONS = [20, 100, 200];
const DEFAULT_PAGE_INFO = {
  page: 1,
  pageSize: 20,
};

export default function Usage() {
  const { data: accountRes } = useAccountQuery();

  const [queryData, setQueryData] = useState(DEFAULT_PAGE_INFO);

  const { data: billingRes } = useQuery(["billing", queryData], async () => {
    return BillingControllerFindAll({
      ...queryData,
    });
  });

  const { t } = useTranslation();
  return (
    <div className="min-h-[500px]">
      <h1 className="mb-4 text-2xl font-bold">Usage</h1>
      <HStack className="mt-4">
        <span className=" text-grayModern-500">{t("Balance")}:</span>
        <span>{(accountRes?.data?.balance ?? 0) / 100}</span>
        <ChargeButton>
          <span className="cursor-pointer text-blue-800">{t("ChargeNow")}</span>
        </ChargeButton>
      </HStack>

      <div className="mt-4 rounded border">
        <TableContainer>
          <Table variant="striped" colorScheme="gray" size={"sm"}>
            <Thead>
              <Tr>
                <Th>AppId</Th>
                <Th>{t("SpecItem.cpu")}</Th>
                <Th>{t("SpecItem.memory")}</Th>
                <Th>{t("Spec.Database")}</Th>
                <Th>{t("Spec.Storage")}</Th>
                <Th>{t("TotalAmount")}</Th>
                <Th>{t("State")}</Th>
                <Th>{t("Duration")}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(billingRes?.data?.list || []).map((item: Definitions.ApplicationBilling) => (
                <Tr key={item._id}>
                  <Td>{item.appid}</Td>
                  <Td>{item.detail?.cpu?.amount}</Td>
                  <Td>{item.detail?.memory?.amount}</Td>
                  <Td>{item.detail?.databaseCapacity?.amount}</Td>
                  <Td>{item.detail?.storageCapacity?.amount}</Td>
                  <Td>{item.amount}</Td>
                  <Td>{item.state}</Td>
                  <Td>
                    {formatDate(item.startAt)} - {formatDate(item.endAt)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <div className="p-4">
            <Pagination
              options={LIMIT_OPTIONS}
              values={getPageInfo(billingRes?.data)}
              onChange={(values: any) => {
                setQueryData({
                  ...values,
                });
              }}
            />
          </div>
        </TableContainer>
      </div>
    </div>
  );
}
