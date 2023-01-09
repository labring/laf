import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";

import SettingModal from "@/pages/app/setting";
import PATList from "@/pages/app/setting/PATList";

export default function UserSetting(props: { avator: string; width: number }) {
  return (
    <Menu>
      <MenuButton>
        <img src={props.avator} className="rounded-full" width={props.width} alt="avatar" />
      </MenuButton>
      <MenuList>
        <SettingModal
          headerTitle="用户设置"
          tabMatch={[
            {
              key: "pat",
              name: "Personal Access Token",
              component: <PATList />,
            },
          ]}
        >
          <MenuItem>用户设置</MenuItem>
        </SettingModal>
        <MenuItem>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
}
