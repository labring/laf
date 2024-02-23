import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@chakra-ui/react";

import EditableTable from "../EditableTable";

import ENVCodeEditor from "./ENVCodeEditor";

import useGlobalStore from "@/pages/globalStore";

export default function ENVEditor(props: {
  env: Array<{ name: string; value: string }>;
  setEnv: any;
  setPureEnv?: any;
  showSwitch?: boolean;
}) {
  const { t } = useTranslation();
  const { env, setEnv, setPureEnv, showSwitch = true } = props;
  const globalStore = useGlobalStore();
  const [isEditorMode, setIsEditorMode] = useState(false);

  return (
    <div className="h-[80%]">
      {showSwitch && isEditorMode ? (
        <div className="h-[379px] rounded-lg border px-4 pt-4">
          <ENVCodeEditor
            value={env
              .map((item) => {
                return `${item.name}=${item.value}`;
              })
              .join("\n")}
            onChange={(value) => {
              setPureEnv(value);
            }}
          />
        </div>
      ) : (
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
            tableHeight: "330px",
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
      )}
      {showSwitch && (
        <div className="mt-4 flex w-full items-center">
          <Switch
            className="mr-2"
            size={"sm"}
            defaultChecked={isEditorMode}
            onChange={() => setIsEditorMode((prev) => !prev)}
          />
          <span>{t("SettingPanel.EditorMode")}</span>
        </div>
      )}
    </div>
  );
}
