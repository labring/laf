import { Outlet } from "react-router-dom";
import clsx from "clsx";

import styles from "./index.module.scss";

export default function LoginReg() {
  return (
    <div className={clsx(styles.container)}>
      <div className={styles.welcomeWrap}>
        <div className={clsx(styles.welcomeText, ["text-primary-600"])}>Welcome to laf !</div>
        <div className={clsx(styles.sloganText, ["text-grayModern-500"])}>
          life is short, you need laf.
        </div>
      </div>
      <Outlet />
    </div>
  );
}
