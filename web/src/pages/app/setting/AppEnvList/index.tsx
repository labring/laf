import { Button, useColorMode } from "@chakra-ui/react";
import clsx from "clsx";
import dotenv from "dotenv";
import { t } from "i18next";

import ConfirmButton from "@/components/ConfirmButton";
import ENVEditor from "@/components/Editor/ENVEditor";

import { useEnvironmentQuery } from "./service";

import useGlobalStore from "@/pages/globalStore";

// convert [{name: "SERVER_SECRET", value: "demo"}, {name: "MOCK", value: "YES"}] to string like SERVER_SECRET=demo\nMOCK=YES
const convertToEnv = (tableData: any[]) => {
  return tableData.reduce((acc, { name, value }) => {
    return acc + `${name}="${value}"\n`;
  }, "");
};

const AppEnvList = (props: { onClose?: () => {} }) => {
  const globalStore = useGlobalStore((state) => state);
  const environmentQuery = useEnvironmentQuery();
  const { colorMode } = useColorMode();
  const darkMode = colorMode === "dark";
  return (
    <>
      <div className="flex h-full flex-grow flex-col">
        <div
          className={clsx("relative h-full flex-1 rounded border", {
            "border-frostyNightfall-200": !darkMode,
          })}
        >
          <ENVEditor
            value={convertToEnv(environmentQuery?.data?.data)}
            height="95%"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
            }}
            onChange={(value) => {
              const obj = dotenv.parse(value || "");

              console.log(obj);
            }}
          />
        </div>
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
