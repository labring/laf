import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ButtonGroup, Switch, useColorMode } from "@chakra-ui/react";
import { Center, Spinner } from "@chakra-ui/react";

import EditableTable from "@/components/EditableTable";
import ENVCodeEditor from "@/components/Editor/ENVCodeEditor";

import { useEnvironmentQuery, useUpdateEnvironmentMutation } from "./service";

import useGlobalStore from "@/pages/globalStore";

const AppEnvList = (props: { onClose?: () => {} }) => {
  const [env, setEnv] = useState<Array<{ name: string; value: string }>>([]);
  const [pureEnv, setPureEnv] = useState("");
  const { isLoading, data } = useEnvironmentQuery((data) => {
    setEnv(data || []);
  });
  const [isENVLoading, setIsENVLoading] = useState(false);
  const updateEnvironmentMutation = useUpdateEnvironmentMutation();
  const globalStore = useGlobalStore();
  const { t } = useTranslation();
  const [isEditorMode, setIsEditorMode] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    let newEnv = pureEnv
      .split("\n")
      .map((v) => v.split("="))
      .filter((v) => v.length >= 2)
      .map((v) => {
        const [name, ...value] = v;
        return {
          name,
          value: value.join("="),
        };
      })
      .filter((v) => v.name !== "" && v.value !== "");

    const envNames: string[] = [];
    newEnv = newEnv.filter((v) => {
      if (envNames.includes(v.name)) return false;
      envNames.push(v.name);
      return true;
    });
    setEnv(newEnv);
  }, [pureEnv]);

  return (
    <>
      <div className="absolute bottom-0 left-[280px] right-6 top-10 mr-6 flex h-full flex-grow flex-col py-4">
        {isLoading ? (
          <Center className="h-[400px]">
            <Spinner />
          </Center>
        ) : (
          <>
            <div>
              {isEditorMode ? (
                <div className="h-[409px] rounded-lg border px-4 pt-4">
                  <ENVCodeEditor
                    value={env
                      .map((item) => {
                        return `${item.name}=${item.value}`;
                      })
                      .join("\n")}
                    onChange={(value) => {
                      setPureEnv(value || "");
                    }}
                    colorMode={colorMode}
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
                    tableHeight: "360px",
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
            </div>
            <div className="mt-4 flex h-8 w-full items-center justify-between">
              <div className="flex items-center">
                <Switch
                  className="mr-2"
                  size={"sm"}
                  defaultChecked={isEditorMode}
                  onChange={() => setIsEditorMode((prev) => !prev)}
                />
                <span>{t("SettingPanel.EditorMode")}</span>
              </div>
              <ButtonGroup className="space-x-4">
                <Button
                  w={24}
                  variant="outline"
                  color={"grayModern.500"}
                  onClick={() => {
                    setEnv(data?.data || []);
                  }}
                >
                  {t("Reset")}
                </Button>
                <Button
                  w={24}
                  isLoading={isENVLoading}
                  onClick={async () => {
                    setIsENVLoading(true);
                    try {
                      const res = await updateEnvironmentMutation.mutateAsync(env);
                      if (!res.error) {
                        globalStore.showSuccess(t("UpdateSuccess"));
                      }
                    } finally {
                      setIsENVLoading(false);
                    }
                  }}
                >
                  {t("Update")}
                </Button>
              </ButtonGroup>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AppEnvList;
