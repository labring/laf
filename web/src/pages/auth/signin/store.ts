import create from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type State = {
  phone: string;
  setPhone: (phone: string) => void;
  validationCode: string;
  setValidationCode: (code: string) => void;
  agreement: boolean;
  setAgreement: (agreement: boolean) => void;
  token: string;
  setToken: (token: string) => void;
};

const useSigninStore = create<State>()(
  devtools(
    immer((set, get) => ({
      phone: "",
      setPhone: (phone: string) => {
        set((state) => {
          state.phone = phone;
        });
      },
      validationCode: "",
      setValidationCode: (code: string) => {
        set((state) => {
          state.validationCode = code;
        });
      },
      agreement: false,
      setAgreement: (agreement: boolean) => {
        set((state) => {
          state.agreement = agreement;
        });
      },
      token: "",
      setToken: (token: string) => {
        set((state) => {
          state.token = token;
        });
      },
    })),
  ),
);

export default useSigninStore;
