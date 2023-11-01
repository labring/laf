import { useEffect, useRef, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  useColorMode,
} from "@chakra-ui/react";
import clsx from "clsx";
import { t } from "i18next";

import { COLOR_MODE } from "@/constants";

import EditableTr, { TColumnItem, TConfiguration } from "./EditableTr";
import NormalTr from "./NormalTr";

const EditableTable = function (props: {
  column: TColumnItem[];
  tableData: any[] | undefined;
  configuration: TConfiguration;
  onEdit: (data: any) => any;
  onDelete: (data: any) => any;
  onCreate: (data: any) => any;
}) {
  const { column, tableData, configuration, onEdit, onCreate, onDelete } = props;
  const [columnList, setColumnList] = useState<TColumnItem[]>(column);
  const [tableList, setTableList] = useState<any[]>([]);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [createData, setCreateData] = useState<any>({});
  const tableRef = useRef<any>(null);

  const { colorMode } = useColorMode();
  const darkMode = colorMode === COLOR_MODE.dark;

  useEffect(() => {
    setColumnList(column);
  }, [column, setColumnList]);

  useEffect(() => {
    const newData = (tableData || []).map((item: any) => {
      return {
        ...item,
        isEdit: false,
      };
    });
    setTableList(newData);
  }, [tableData, setTableList]);

  const handleSwitchEdit = function (key: string, status: boolean) {
    const newList = tableList?.map((item: any) => {
      return {
        ...item,
        isEdit: item[configuration.key] === key ? status : item.isEdit,
      };
    });
    setTableList(newList);
  };

  const handleAdd = function () {
    setTimeout(() => {
      tableRef.current?.scrollTo({
        top: tableRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);

    if (isCreate) {
      return false;
    }
    const newItem: any = { isEdit: true };
    for (let { key, defaultValue } of column) {
      newItem[key] = defaultValue || "";
    }
    setCreateData(newItem);
    setIsCreate(true);
  };

  return (
    <>
      <div
        className={clsx("relative rounded-t-md border border-b-0", {
          "border-frostyNightfall-200": !darkMode,
        })}
      >
        <TableContainer
          roundedTop={"md"}
          h={configuration?.tableHeight || "250px"}
          overflowY="auto"
          ref={tableRef}
        >
          <Table variant="simple">
            <Thead
              className={clsx("border-b", {
                "bg-lafWhite-300": !darkMode,
                "text-grayModern-500": !darkMode,
              })}
            >
              <Tr>
                {columnList.map((item: TColumnItem) => {
                  return <Th key={item.key}>{item.name}</Th>;
                })}
                <Th key="operation" isNumeric>
                  {t("Operation")}
                </Th>
              </Tr>
            </Thead>
            <Tbody className="font-mono">
              {(tableList || []).map((item: any, index: number) => {
                const generalParameters = {
                  configuration,
                  column: columnList,
                  data: item,
                };
                return (
                  <Tr
                    key={item[configuration.key]}
                    className={clsx("!h-12 border-b", {
                      "hover:bg-lafWhite-300": !darkMode,
                      "border-frostyNightfall-200": !darkMode,
                    })}
                  >
                    {item.isEdit ? (
                      <EditableTr
                        index={index}
                        {...generalParameters}
                        onSave={(newData: any) => {
                          const data = { ...newData };
                          delete data.isEdit;
                          onEdit({ newData: data, item });
                        }}
                        onCancel={(key: string) => handleSwitchEdit(key, false)}
                      />
                    ) : (
                      <NormalTr
                        {...generalParameters}
                        onEdit={(key: string) => handleSwitchEdit(key, true)}
                        onDelete={(key: string) => onDelete && onDelete(key)}
                      />
                    )}
                  </Tr>
                );
              })}
              <Tr
                key="create"
                className={clsx({
                  "hover:bg-lafWhite-300": !darkMode,
                })}
              >
                {isCreate ? (
                  <EditableTr
                    index={-1}
                    configuration={configuration}
                    column={columnList}
                    isCreate={true}
                    data={createData}
                    onSave={async (newData: any) => {
                      const data = { ...newData };
                      delete data.isEdit;
                      await onCreate(data);
                      setIsCreate(false);
                      setCreateData({});
                    }}
                    onCancel={() => setIsCreate(false)}
                  />
                ) : null}
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </div>
      <Button
        leftIcon={<AddIcon />}
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: "10px",
          borderBottomLeftRadius: "10px",
          color: "#7B838B",
          fontWeight: 400,
          fontSize: "12px",
          width: "100%",
          height: "48px",
        }}
        onClick={handleAdd}
        variant="outline"
      >
        {configuration?.addButtonText ? configuration.addButtonText : t("AddData")}
      </Button>
    </>
  );
};

export default EditableTable;
