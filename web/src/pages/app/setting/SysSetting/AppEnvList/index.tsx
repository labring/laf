import { useState } from "react";
import { Button } from "@chakra-ui/react";
import { t } from "i18next";

import ENVEditor from "@/components/Editor/ENVEditor";

import { useEnvironmentQuery, useUpdateEnvironmentMutation } from "./service";

const AppEnvList = (props: { onClose?: () => {} }) => {
  const [env, setEnv] = useState<Array<{ name: string; value: string }>>([]);
  useEnvironmentQuery((data) => {
    setEnv(data || []);
  });
  const updateEnvironmentMutation = useUpdateEnvironmentMutation();

  return (
    <>
      <div className="absolute bottom-0 left-[280px] right-6 top-10 mr-6 flex h-full flex-grow flex-col py-4">
        <ENVEditor env={env} setEnv={setEnv} />
        <Button
          className="mt-4 h-8 w-28 self-end"
          variant="secondary"
          onClick={async () => {
            const res = await updateEnvironmentMutation.mutateAsync(env);
            if (!res.error) {
              props.onClose && props.onClose();
            }
          }}
        >
          {t("Update")}
        </Button>
      </div>
    </>
  );
};

export default AppEnvList;
