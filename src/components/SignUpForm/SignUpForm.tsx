"use client";

import { useSignUpForm } from "@/hooks/useSignUpForm";
import styles from "./SignUpForm.module.scss";

const SignUpForm = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    message,
    loading,
    handleSubmit,
  } = useSignUpForm();

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles["form__input-group"]}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Inserisci la tua email"
          className={styles.form__input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className={styles["form__input-group"]}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Inserisci la tua password"
          className={styles.form__input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      {error && <p className={styles.form__error}>{error}</p>}
      {message && <p className={styles.form__message}>{message}</p>}

      <button type="submit" disabled={loading} className={styles.form__button}>
        {loading ? "Registrando..." : "Registrati"}
      </button>
    </form>
  );
};

export default SignUpForm;
