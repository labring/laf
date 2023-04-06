import { Outlet } from "react-router-dom";

import styles from "./index.module.scss";

export default function LoginReg() {
  return (
    <div className={styles.container}>
      <div className="absolute left-[120px] top-[120px]">
        <div className="text-[36px] text-primary-600">Welcome to laf !</div>
        <div className="text-[20px] text-grayModern-500">life is short, you need laf.</div>
      </div>
      <Outlet />
    </div>
  );
}
