import { useEffect, useRef, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import { Button, Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react";

import EditableTr, { TColumnItem, TConfiguration } from "./EditableTr";
import NormalTr from "./NormalTr";

const EditableTable = function (props: {
  column: TColumnItem[];
  tableData: any[] | undefined;
  configuration: TConfiguration;
  onEdit: (data: any) => Promise<any>;
  onDelete: (data: any) => Promise<any>;
  onCreate: (data: any) => Promise<any>;
}) {
  const { column, tableData, configuration, onEdit, onCreate, onDelete } = props;
  const [columnList, setColumnList] = useState<TColumnItem[]>(column);
  const [tabelList, setTableList] = useState<any[]>([]);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [createData, setCreateData] = useState<any>({});
  const tableRef = useRef<any>(null);

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
    const newList = tabelList?.map((item: any) => {
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
      <div className="px-4 py-1 mb-2 rounded-md relative border">
        <TableContainer h={"250px"} overflowY="auto" ref={tableRef}>
          <Table variant="simple">
            <Thead>
              <Tr>
                {columnList.map((item: TColumnItem) => {
                  return (
                    <Th width={item.width || ""} key={item.key}>
                      {item.name}
                    </Th>
                  );
                })}
                <Th width={200} key="operation">
                  操作
                </Th>
              </Tr>
            </Thead>
            <Tbody className="font-mono">
              {(tabelList || []).map((item: any, index: number) => {
                const generalParameters = {
                  configuration,
                  column: columnList,
                  data: item,
                };
                return (
                  <Tr key={item[configuration.key]} _hover={{ bgColor: "#efefef" }}>
                    {item.isEdit ? (
                      <EditableTr
                        index={index}
                        {...generalParameters}
                        onSave={(newData: any) => {
                          const data = { ...newData };
                          delete data.isEdit;
                          onEdit(data);
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
              <Tr key="create" _hover={{ bgColor: "#efefef" }}>
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
        style={{ borderStyle: "dashed" }}
        size="m"
        px="6"
        className="h-10 rounded-md"
        onClick={handleAdd}
        variant="outline"
      >
        {configuration?.addButtonText ? configuration.addButtonText : "新增数据"}
      </Button>
    </>
  );
};

export default EditableTable;
