import { useTranslation } from "react-i18next";

import EditableTable from "../EditableTable";

import useGlobalStore from "@/pages/globalStore";

export default function ENVEditor(props: {
  env: Array<{ name: string; value: string }>;
  setEnv: any;
}) {
  const { t } = useTranslation();
  const { env, setEnv } = props;
  const globalStore = useGlobalStore();

  return (
    <EditableTable
      column={[
        {
          name: "Key",
          key: "name",
          width: "130px",
          validate: [
            (data: any) => {
              return {
                isValidate: data !== "",
                errorInfo: t("KeyCannotBeEmpty").toString(),
              };
            },
          ],
        },
        {
          name: "Value",
          key: "value",
          width: "290px",
          validate: [
            (data: any) => {
              return {
                isValidate: data !== "",
                errorInfo: t("ValueCannotBeEmpty").toString(),
              };
            },
          ],
        },
      ]}
      configuration={{
        key: "name",
        tableHeight: "310px",
        hiddenEditButton: false,
        addButtonText: String(t("AddENV")),
        saveButtonText: String(t("Confirm")),
      }}
      tableData={env}
      onEdit={(data) => {
        setEnv(
          env.map((item) => {
            if (item.name === data.item.name) {
              return data.newData;
            }
            return item;
          }),
        );
      }}
      onDelete={(data) => {
        setEnv(env.filter((item) => item.name !== data));
      }}
      onCreate={(data) => {
        if (env.find((item) => item.name === data.name)) {
          globalStore.showError(t("KeyAlreadyExists").toString());
          return;
        }
        setEnv([...env, data]);
      }}
    />
  );
}
