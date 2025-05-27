"use client";

import { useLoginForm } from "@/hooks/useLoginInForm";
import styles from "./LoginForm.module.scss";

export function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    errorMsg,
    loading,
    handleLogin,
  } = useLoginForm();

  return (
    <form onSubmit={handleLogin} className={styles.form}>
      <div className={styles["form__input-group"]}>
        <label htmlFor="email">Email</label>
        <input
          className={styles.form__input}
          id="email"
          type="email"
          placeholder="Inserisci la tua email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className={styles["form__input-group"]}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Inserisci la tua password"
          value={password}
          className={styles.form__input}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {errorMsg && <p className={styles.form__error}>{errorMsg}</p>}

      <button type="submit" disabled={loading} className={styles.form__button}>
        {loading ? "Caricamento..." : "Login"}
      </button>
    </form>
  );
}
