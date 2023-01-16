/****************************
 * laf website header nav
 ***************************/

import { RiCodeBoxFill } from "react-icons/ri";

import UserSetting from "./UserSetting";

import useGlobalStore from "@/pages/globalStore";

export default function Header(props: { size: "sm" | "lg" }) {
  const { userInfo } = useGlobalStore((state) => state);

  return (
    <div className="flex justify-between px-10 py-4">
      <div className="flex items-center">
        <RiCodeBoxFill size={32} className="mr-2" color="green" />
        <span className="text-2xl font-semibold">LaF</span>
      </div>

      <div>
        {userInfo.profile ? <UserSetting avatar={userInfo.profile?.avatar} width={30} /> : null}
      </div>
    </div>
  );
}
