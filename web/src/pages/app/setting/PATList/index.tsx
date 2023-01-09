import { useState } from "react";
import { Button } from "@chakra-ui/react";

import CopyText from "@/components/CopyText";
import EditableTable from "@/components/EditableTable";
import { formatDate, formatDateOption } from "@/utils/format";

import DateSelector from "./DateSelector";
import { TPAT, useAddPATMutation, useDelPATMutation, usePATQuery } from "./service";

const PATList = () => {
  const [formatPATList, setFormatPATList] = useState<TPAT[]>();

  usePATQuery((data) => {
    const newPATList = (data || []).map((item: any) => {
      return {
        ...item,
        expiresIn: formatDate(item.expiredAt),
      };
    });
    setFormatPATList(newPATList);
  });

  const delPATMutation = useDelPATMutation();
  const addPATMutation = useAddPATMutation();

  const now = new Date();
  const dateList = formatDateOption();
  return (
    <>
      <div className="flex-grow h-320 flex flex-col">
        <EditableTable
          column={[
            {
              name: "name",
              key: "name",
              width: "200px",
              textWidth: "60",
              valiate: [
                (data: any) => {
                  return {
                    isValiate: data !== "",
                    errorInfo: "name不能为空",
                  };
                },
              ],
            },
            {
              name: "过期时间",
              key: "expiresIn",
              textWidth: "40",
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
            addButtonText: "新增Token",
            saveButtonText: "生成Token",
            operationButtonsRender: (data: any) => {
              return (
                <CopyText text={data.name} tip="name复制成功">
                  <Button variant={"link"} size="xs" colorScheme={"blue"}>
                    复制name
                  </Button>
                </CopyText>
              );
            },
          }}
          tableData={formatPATList}
          onEdit={(data) => addPATMutation.mutateAsync(data)}
          onDelete={(data) => delPATMutation.mutateAsync({ id: data })}
          onCreate={(data) =>
            addPATMutation.mutateAsync({ ...data, expiresIn: Number(data.expiresIn) })
          }
        />
      </div>
    </>
  );
};

export default PATList;
