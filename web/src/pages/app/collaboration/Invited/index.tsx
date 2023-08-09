import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

import { useGroupMemberAddMutation, useGroupQueryByCode } from "../service";

import { Icon, Text } from "./logo_invite";

import { ApplicationControllerFindAll } from "@/apis/v1/applications";
import useGlobalStore from "@/pages/globalStore";
import { APP_LIST_QUERY_KEY } from "@/pages/home";

export default function Invited() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const joinGroupMutation = useGroupMemberAddMutation();

  const [code, setCode] = useState("");
  const { showSuccess } = useGlobalStore();

  const { data: groupData, isLoading } = useGroupQueryByCode(
    { code },
    {
      enabled: !!code,
      onSuccess(data) {
        if (data.statusCode === 404) {
          navigate("/404");
          return;
        }
        sessionStorage.setItem(
          "collaborationCode",
          JSON.stringify({ code: code, appid: data?.data?.group?.appid }),
        );
      },
    },
  );

  useQuery(
    APP_LIST_QUERY_KEY,
    () => {
      return ApplicationControllerFindAll({});
    },
    {
      enabled: !!groupData && !!localStorage.getItem("token"),
      onSuccess(data) {
        if (data.data.find((item: any) => item.appid === groupData?.data?.group?.appid)) {
          sessionStorage.removeItem("collaborationCode");
          navigate(`/app/${groupData?.data?.group?.appid}/function`);
          return;
        }
      },
    },
  );

  useEffect(() => {
    let code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      setCode(code);
    } else {
      navigate("/404");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      {isLoading ? (
        <Spinner />
      ) : (
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
                  userName: groupData?.data?.invitedBy?.username || "",
                  appName: groupData?.data?.group?.name || "",
                  appid: groupData?.data?.group?.appid || "",
                  role: groupData?.data?.role || "",
                }}
              />
            </span>
            <Button
              className="mt-20 !h-9 w-[360px]"
              onClick={async () => {
                const res = await joinGroupMutation.mutateAsync({ code });
                if (!res.error) {
                  showSuccess(t("Collaborate.JoinSuccess"));
                }
                navigate(`/app/${groupData?.data?.group?.appid}/function`);
              }}
            >
              {t("Collaborate.Accept")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
