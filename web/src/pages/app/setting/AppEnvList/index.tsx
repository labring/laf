import EditableTable from "@/components/EditableTable";
import { isExitInList } from "@/utils/format";

import EditTextarea from "./EditTextarea";
import {
  useAddEnvironmentMutation,
  useDelEnvironmentMutation,
  useEnvironmentQuery,
} from "./service";

const AppEnvList = () => {
  const environmentQuery = useEnvironmentQuery();
  const delEnvironmentMutation = useDelEnvironmentMutation();
  const addEnvironmentMutation = useAddEnvironmentMutation();
  return (
    <>
      <div className="flex-grow h-320 flex flex-col">
        <EditableTable
          column={[
            {
              name: "name",
              key: "name",
              width: "200px",
              textWidth: "40",
              valiate: [
                (data: any) => {
                  return {
                    isValiate: data !== "",
                    errorInfo: "name不能为空",
                  };
                },
                (data: any, index: number) => {
                  const IndexList = isExitInList("name", data, environmentQuery?.data?.data);
                  return {
                    isValiate: IndexList.length === 0 || IndexList.indexOf(index) !== -1,
                    errorInfo: "name不能重复",
                  };
                },
              ],
              editComponent: (data: any) => {
                return <EditTextarea text="name" {...data} />;
              },
            },
            {
              name: "value",
              key: "value",
              textWidth: "40",
              valiate: [
                (data: any) => {
                  return {
                    isValiate: data !== "",
                    errorInfo: "value不能为空",
                  };
                },
              ],
              editComponent: (data: any) => {
                return <EditTextarea text="value" {...data} />;
              },
            },
          ]}
          configuration={{
            key: "name",
            addButtonText: "新增环境变量",
          }}
          tableData={environmentQuery?.data?.data}
          onEdit={(data) => addEnvironmentMutation.mutateAsync(data)}
          onDelete={(data) => delEnvironmentMutation.mutateAsync({ name: data })}
          onCreate={(data) => addEnvironmentMutation.mutateAsync(data)}
        />
      </div>
    </>
  );
};

export default AppEnvList;
