import { Button } from "@chakra-ui/react";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
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
      <div className="flex  flex-grow flex-col">
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
            tableHeight: "40vh",
            key: "name",
            addButtonText: t("SettingPanel.AddAppEnv").toString(),
          }}
          tableData={environmentQuery?.data?.data}
          onEdit={(data) => addEnvironmentMutation.mutateAsync(data)}
          onDelete={(data) => delEnvironmentMutation.mutateAsync({ name: data })}
          onCreate={(data) => addEnvironmentMutation.mutateAsync(data)}
        />
        <ConfirmButton
          onSuccessAction={() => {
            globalStore.updateCurrentApp(globalStore.currentApp!);
            props.onClose && props.onClose();
          }}
          headerText={String(t("Update"))}
          bodyText={String(t("SettingPanel.UpdateConfirm"))}
          confirmButtonText={String(t("Update"))}
        >
          <Button className="mt-4 h-8 w-28 self-end">{t("Update")}</Button>
        </ConfirmButton>
      </div>
    </>
  );
};

export default AppEnvList;
