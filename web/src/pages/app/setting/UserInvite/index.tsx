import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CopyIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { Button, Center, Input, Spinner, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";

import CopyText from "@/components/CopyText";
import EmptyBox from "@/components/EmptyBox";
import Pagination from "@/components/Pagination";
import { formatDate, formatPrice } from "@/utils/format";
import getPageInfo from "@/utils/getPageInfo";

import { useGetInviteCode, useGetInviteCodeProfit } from "./service";
const LIMIT_OPTIONS = [5, 20, 100];

export default function UserInvite() {
  const darkMode = useColorMode().colorMode === "dark";
  const { t } = useTranslation();
  const [queryData, setQueryData] = useState({ page: 1, pageSize: 5 });

  const inviteCodeQuery = useGetInviteCode();
  const inviteCode = inviteCodeQuery.data?.data?.code;
  const inviteLink = inviteCodeQuery.isLoading
    ? "Loading..."
    : `${window.location.origin}/signup?code=${inviteCode}`;

  const profitQuery = useGetInviteCodeProfit(queryData);
  const profitData = profitQuery.data?.data;

  return (
    <div className="pt-10">
      <span className="text-lg text-grayModern-500">{t("UserInfo.InviteLink")}</span>
      <div className="flex items-center pt-3">
        <CopyText text={inviteLink}>
          <Input value={inviteLink} height={8} mr={4} readOnly />
        </CopyText>
        <CopyText text={inviteLink} hideToolTip>
          <Button variant="secondary" className="flex h-[30px] items-center">
            <CopyIcon className="mr-2" />
            {t("Copy")}
          </Button>
        </CopyText>
      </div>
      <div className="mb-6 mt-3 flex items-center bg-[#ECF8FF] px-4 py-2">
        <InfoOutlineIcon className="mr-1 !text-[#219BF4]" />
        <span className="text-[#0884DD]">{t("UserInfo.InviteTips")}</span>
      </div>
      <span className="text-lg text-grayModern-500">{t("UserInfo.BonusDetails")}</span>
      <div className="pt-3">
        <div
          className={clsx(
            "flex rounded-t-md px-3 py-2",
            !darkMode && "bg-[#F6F8F9] text-grayModern-500",
          )}
        >
          <span className="w-3/12">{t("UserInfo.Time")}</span>
          <span className="w-7/12">{t("UserInfo.Channel")}</span>
          <span className="flex w-2/12 justify-end">{t("UserInfo.Bonus")}</span>
        </div>
        {(profitData?.list || []).map((item: any) => (
          <div
            key={item._id}
            className={darkMode ? "flex px-3 py-2" : "flex px-3 py-2 text-grayModern-700"}
          >
            <span className="w-3/12">{formatDate(item.createdAt)}</span>
            <span className="w-7/12">{item?.username}</span>
            <span className="flex w-2/12 justify-end text-primary-600">
              {formatPrice(item.inviteProfit)}
            </span>
          </div>
        ))}
      </div>
      {profitQuery.isLoading ? (
        <Center style={{ minHeight: 200 }}>
          <Spinner />
        </Center>
      ) : profitData?.list && profitData?.list.length > 0 ? (
        <Pagination
          options={LIMIT_OPTIONS}
          values={getPageInfo(profitData)}
          onChange={(values: any) => setQueryData(values)}
        />
      ) : (
        <Center style={{ minHeight: 200 }}>
          <EmptyBox>
            <span>{t("No History")}</span>
          </EmptyBox>
        </Center>
      )}
    </div>
  );
}
