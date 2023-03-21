import { Outlet } from "react-router-dom";
import clsx from "clsx";

import styles from "./index.module.scss";

export default function LoginReg() {
  return (
    <div className={clsx(styles.container)}>
      <div className={styles.welcomeWrap}>
        <div className={styles.welcomeText}>Welcome to laf !</div>
        <div className={styles.sloganText}>life is short, you need laf.</div>
      </div>
      <Outlet />
    </div>
  );
}
