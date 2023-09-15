import { useMutation } from "@tanstack/react-query";

import { AccountControllerGiftCode } from "@/apis/v1/accounts";

export const useGiftCodeMutation = (config?: { onSuccess: (result: any) => void }) => {
  return useMutation(
    (values: any) => {
      return AccountControllerGiftCode(values);
    },
    {
      onSuccess: async (result) => {
        config?.onSuccess(result);
      },
    },
  );
};
