import { Outlet } from "react-router-dom";

import styles from "./index.module.scss";

export default function LoginReg() {
  return (
    <div className={styles.container}>
      <div className="absolute top-[120px] left-[120px]">
        <div className="text-primary-600 text-[36px]">Welcome to laf !</div>
        <div className="text-grayModern-500 text-[20px]">life is short, you need laf.</div>
      </div>
      <Outlet />
    </div>
  );
}
