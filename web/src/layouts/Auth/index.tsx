import { Outlet } from "react-router-dom";
import clsx from "clsx";

import styles from "./index.module.scss";

export default function LoginReg() {
  return (
    <div className={clsx(styles.container)}>
      <Outlet />
    </div>
  );
}
