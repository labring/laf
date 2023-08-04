import { Trans, useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Button } from "@chakra-ui/react";

import { Icon, Text } from "./logo";

const data = {
  userName: "userName1",
  teamName: "teamName1",
  position: "Developer",
  status: "pending",
};

export default function Invited() {
  const { t } = useTranslation();
  const location = useLocation();
  const { pathname } = location;
  console.log(pathname);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="w-[590px]">
        <div className="flex h-16 items-center justify-center rounded-t-2xl bg-primary-600">
          <span className="pr-3">
            <Icon />
          </span>
          <Text />
        </div>
        <div className="flex h-[424px] flex-col items-center justify-center rounded-b-2xl bg-white">
          <span className="text-[30px] font-semibold text-[#262A32]">
            {t("Collaborate.Invitation")}
          </span>
          <span className="w-[332px] text-clip pt-10 text-center text-xl text-[#262A32]">
            <Trans
              t={t}
              i18nKey="Collaborate.InvitationContent"
              values={{
                ...data,
              }}
            />
          </span>
          <Button
            className="mt-20 !h-9 w-[360px]"
            onClick={() => {
              console.log("accept");
            }}
            isDisabled={data.status !== "pending"}
          >
            {data.status === "pending" ? t("Collaborate.Accept") : t("Collaborate.Accepted")}
          </Button>
        </div>
      </div>
    </div>
  );
}
