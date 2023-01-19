import { Button } from "@chakra-ui/react";
import { t } from "i18next";

import EditableTable from "@/components/EditableTable";
import { isExitInList } from "@/utils/format";

import EditTextarea from "./EditTextarea";
import {
  useAddEnvironmentMutation,
  useDelEnvironmentMutation,
  useEnvironmentQuery,
} from "./service";

import useGlobalStore from "@/pages/globalStore";

const AppEnvList = (props: { onClose?: () => {} }) => {
  const globalStore = useGlobalStore((state) => state);
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
              width: "150px",
              editable: false,
              validate: [
                (data: any) => {
                  return {
                    isValidate: data !== "",
                    errorInfo: "name不能为空",
                  };
                },
                (data: any, index: number) => {
                  const IndexList = isExitInList("name", data, environmentQuery?.data?.data);
                  return {
                    isValidate: IndexList.length === 0 || IndexList.indexOf(index) !== -1,
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
              width: "200px",
              validate: [
                (data: any) => {
                  return {
                    isValidate: data !== "",
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
            tableHeight: "200px",
            key: "name",
            addButtonText: t("SettingPanel.AddAppEnv").toString(),
          }}
          tableData={environmentQuery?.data?.data}
          onEdit={(data) => addEnvironmentMutation.mutateAsync(data)}
          onDelete={(data) => delEnvironmentMutation.mutateAsync({ name: data })}
          onCreate={(data) => addEnvironmentMutation.mutateAsync(data)}
        />
        <Button
          className="w-28 h-8 self-end mt-4"
          type="submit"
          variant={"secondary"}
          onClick={() => {
            globalStore.restartCurrentApp();
            props.onClose && props.onClose();
          }}
        >
          {t("Update")}
        </Button>
      </div>
    </>
  );
};

export default AppEnvList;
