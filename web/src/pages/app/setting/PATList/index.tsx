import { useState } from "react";
import { t } from "i18next";

import CopyText from "@/components/CopyText";
import EditableTable from "@/components/EditableTable";
import TextButton from "@/components/TextButton";
import { formatDate, formatDateOption } from "@/utils/format";

import DateSelector from "./DateSelector";
import { TPAT, useAddPATMutation, useDelPATMutation, usePATQuery } from "./service";

const PATList = () => {
  const [formatPATList, setFormatPATList] = useState<TPAT[]>();
  const [tokenList, setTokenList] = useState<{ id: string; token: string }[]>([]);
  usePATQuery((data) => {
    const newPATList = (data || []).map((item: any) => {
      return {
        ...item,
        expiresIn: formatDate(item.expiredAt),
      };
    });
    setFormatPATList(newPATList);
  });

  const delPATMutation = useDelPATMutation(() => {});
  const addPATMutation = useAddPATMutation((data: any) => {
    const newTokenList = [...tokenList];
    newTokenList.push({
      id: data.id,
      token: data.token,
    });
    setTokenList(newTokenList);
  });

  const now = new Date();
  const dateList = formatDateOption();
  return (
    <>
      <div className="flex flex-grow flex-col">
        <EditableTable
          column={[
            {
              name: "name",
              key: "name",
              width: "150px",
              validate: [
                (data: any) => {
                  return {
                    isValidate: data !== "",
                    errorInfo: "name不能为空",
                  };
                },
              ],
            },
            {
              name: t("SettingPanel.Expire").toString(),
              width: "290px",
              key: "expiresIn",
              editable: false,
              defaultValue: dateList[0].value,
              editComponent: (props: any) => {
                return (
                  <DateSelector
                    setting={{ now: now, dateList: dateList }}
                    value={props.value}
                    onChange={props.onChange}
                  />
                );
              },
            },
          ]}
          configuration={{
            key: "id",
            tableHeight: "40vh",
            hiddenEditButton: true,
            addButtonText: t("Add") + "Token",
            saveButtonText: t("Generate") + "Token",
            operationButtonsRender: (data: any) => {
              const tokenItem = tokenList?.filter((item) => item.id === data.id);
              return tokenItem?.length === 1 ? (
                <CopyText className="mr-4" text={tokenItem[0].token} tip={t("Copied").toString()}>
                  <TextButton text={t("Copy") + "Token"} />
                </CopyText>
              ) : null;
            },
          }}
          tableData={formatPATList}
          onEdit={async () => {}}
          onDelete={async (data) => {
            await delPATMutation.mutateAsync({ id: data });
            const newTokenList = tokenList.filter((token) => {
              return token.id !== data;
            });
            setTokenList(newTokenList);
          }}
          onCreate={(data) =>
            addPATMutation.mutateAsync({ ...data, expiresIn: Number(data.expiresIn) })
          }
        />
      </div>
    </>
  );
};

export default PATList;
