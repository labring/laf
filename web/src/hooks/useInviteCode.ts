import { useEffect, useState } from "react";

const useInviteCode = () => {
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    let code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      const now = new Date();
      const expirationDays = 7;
      const expiration = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);

      const item = {
        value: code,
        expiration: expiration.getTime(),
      };

      localStorage.setItem("inviteCode", JSON.stringify(item));
    } else {
      const item = localStorage.getItem("inviteCode");

      if (item) {
        const data = JSON.parse(item);
        if (new Date().getTime() > data.expiration) {
          localStorage.removeItem("inviteCode");
        } else {
          code = data.value;
        }
      }
    }

    setInviteCode(code);
  }, []);

  return inviteCode;
};

export default useInviteCode;
