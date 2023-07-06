import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import { BillingIcon } from "@/components/CommonIcon";
import Pagination from "@/components/Pagination";
import { formatDate } from "@/utils/format";
import getPageInfo from "@/utils/getPageInfo";

import { BillingControllerFindAll } from "@/apis/v1/billings";

const LIMIT_OPTIONS = [10, 20, 100, 200];
const DEFAULT_PAGE_INFO = {
  page: 1,
  pageSize: 10,
};

export default function BillingDetails() {
  const { t } = useTranslation();

  const [queryData, setQueryData] = useState(DEFAULT_PAGE_INFO);
  const { data: billingRes } = useQuery(["billing", queryData], async () => {
    return BillingControllerFindAll({
      ...queryData,
    });
  });

  return (
    <div>
      <div className="flex items-center pt-2 text-2xl">
        <BillingIcon boxSize={5} mr={3} />
        {t("SettingPanel.BillingDetails")}
      </div>
      <div className="mt-2 rounded border">
        <TableContainer>
          <Table variant="striped" colorScheme="gray" size={"sm"}>
            <Thead>
              <Tr>
                <Th>AppId</Th>
                <Th>{t("Duration")}</Th>
                <Th>{t("SpecItem.cpu")}</Th>
                <Th>{t("SpecItem.memory")}</Th>
                <Th>{t("Spec.Database")}</Th>
                <Th>{t("Spec.Storage")}</Th>
                <Th>{t("State")}</Th>
                <Th>{t("TotalAmount")}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(billingRes?.data?.list || []).map((item: any) => (
                <Tr key={item._id}>
                  <Td>{item.appid}</Td>
                  <Td>{formatDate(item.endAt)}</Td>
                  <Td>{item.detail?.cpu?.amount}</Td>
                  <Td>{item.detail?.memory?.amount}</Td>
                  <Td>{item.detail?.databaseCapacity?.amount}</Td>
                  <Td>{item.detail?.storageCapacity?.amount}</Td>
                  <Td>{item.state}</Td>
                  <Td>{item.amount}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <div className="p-2">
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
