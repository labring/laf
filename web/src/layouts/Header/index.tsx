/****************************
 * laf website header nav
 ***************************/

import UserSetting from "./UserSetting";

import useGlobalStore from "@/pages/globalStore";

export default function Header(props: { size: "sm" | "lg" }) {
  const { userInfo } = useGlobalStore((state) => state);

  return (
    <div className="flex justify-between px-10 py-4 h-[60px]">
      <div className="flex items-center">
        <img src="/logo.png" alt="logo" width={30} />
      </div>

      <div>
        {userInfo?.profile ? (
          <UserSetting
            name={userInfo?.profile?.name}
            avatar={userInfo?.profile?.avatar}
            width={"30px"}
          />
        ) : null}
      </div>
    </div>
  );
}
