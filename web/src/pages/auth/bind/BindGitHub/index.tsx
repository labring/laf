import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";
import { t } from "i18next";

import { Routes } from "@/constants";

import {
  useGithubAuthControllerBindMutation,
  useGithubAuthControllerSigninMutation,
} from "@/pages/auth/service";
import useGlobalStore from "@/pages/globalStore";

export default function BindGitHub() {
  const navigate = useNavigate();
  const location = useLocation();

  const githubAuthControllerSigninMutation = useGithubAuthControllerSigninMutation();
  const githubAuthControllerBindMutation = useGithubAuthControllerBindMutation();

  const showSuccess = useGlobalStore((state) => state.showSuccess);

  useEffect(() => {
    async function getGithubToken() {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get("code");
      if (code) {
        const res = await githubAuthControllerSigninMutation.mutateAsync({
          code,
        });

        if (!res.error) {
          localStorage.setItem("token", res.data);
          navigate(Routes.dashboard, { replace: true });
        } else if (localStorage.getItem("token") && res.data) {
          const bind_res = await githubAuthControllerBindMutation.mutateAsync({
            token: res.data,
          });
          if (!bind_res.error) {
            showSuccess(t("AuthPanel.BindSuccess"));
          }
          navigate(Routes.dashboard, { replace: true });
        } else if (!localStorage.getItem("token")) {
          navigate(Routes.login, { replace: true });
          res.data && sessionStorage.setItem("githubToken", res.data);
        } else {
          navigate(Routes.dashboard, { replace: true });
        }
      }
    }
    getGithubToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 space-x-4 text-grayModern-700">
      <div>
        <Spinner />
      </div>
      <div className="pb-6 text-2xl font-semibold">{t("AuthPanel.GitHubLogin")}</div>
    </div>
  );
}
