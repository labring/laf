import { useState } from "react";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { Center, Spinner } from "@chakra-ui/react";
import { t } from "i18next";

import ENVEditor from "@/components/Editor/ENVEditor";

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

  return (
    <>
      <div className="absolute bottom-0 left-[280px] right-6 top-10 mr-6 flex h-full flex-grow flex-col py-4">
        {isLoading || isENVLoading ? (
          <Center className="h-[360px]">
            <Spinner />
          </Center>
        ) : (
          <ENVEditor env={env} setEnv={setEnv} setPureEnv={setPureEnv} />
        )}
        <ButtonGroup className="mt-4 h-8 space-x-4 self-end">
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
            variant="secondary"
            onClick={async () => {
              setIsENVLoading(true);
              if (pureEnv) {
                const newEnv = pureEnv
                  ?.split("\n")
                  .map((item) => {
                    const [name, ...value] = item.split("=");
                    return {
                      name,
                      value: value.join("="),
                    };
                  })
                  .filter((item) => item.name !== "");
                const res = await updateEnvironmentMutation.mutateAsync(newEnv);
                if (!res.error) {
                  setIsENVLoading(false);
                  globalStore.showSuccess(t("UpdateSuccess"));
                }
              } else {
                const res = await updateEnvironmentMutation.mutateAsync(env);
                if (!res.error) {
                  setIsENVLoading(false);
                  globalStore.showSuccess(t("UpdateSuccess"));
                }
              }
            }}
          >
            {t("Update")}
          </Button>
        </ButtonGroup>
      </div>
    </>
  );
};

export default AppEnvList;
