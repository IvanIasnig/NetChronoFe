"use client";

import { LoginForm } from "@/components/LoginForm/LoginForm";
import SignUpForm from "@/components/SignUpForm/SignUpForm";
import { useState } from "react";
import styles from "./page.module.scss";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className={styles.auth}>
      <div className={styles.auth__box}>
        <div className={styles.auth__toggle}>
          <button
            onClick={() => setIsLogin(true)}
            className={`${styles.auth__button} ${
              isLogin ? styles["auth__button--active"] : ""
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`${styles.auth__button} ${
              !isLogin ? styles["auth__button--active"] : ""
            }`}
          >
            Registrati
          </button>
        </div>

        <div className={styles.auth__form}>
          {isLogin ? <LoginForm /> : <SignUpForm />}
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
