import { useTranslation } from "react-i18next";
import { Center, Spinner } from "@chakra-ui/react";

import EditableTable from "../EditableTable";

export default function ENVEditor(props: {
  env: Array<{ name: string; value: string }>;
  setEnv: any;
}) {
  const { t } = useTranslation();
  const { env, setEnv } = props;

  return (
    <div>
      {env && env.length > 0 ? (
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
          onEdit={async (data) => {
            setEnv(
              env.map((item) => {
                if (item.name === data.item.name) {
                  return data.newData;
                }
                return item;
              }),
            );
          }}
          onDelete={async (data) => {
            setEnv(env.filter((item) => item.name !== data));
          }}
          onCreate={async (data) => {
            setEnv([...env, data]);
          }}
        />
      ) : (
        <Center className="h-[360px]">
          <Spinner />
        </Center>
      )}
    </div>
  );
}
