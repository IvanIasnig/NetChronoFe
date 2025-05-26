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
    <main className={styles.signup}>
      <h1 className={styles.signup__title}>Registrati</h1>
      <form onSubmit={handleSubmit} className={styles.signup__form}>
        <label htmlFor="email" className={styles.signup__label}>
          Email:
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className={styles.signup__input}
        />

        <label htmlFor="password" className={styles.signup__label}>
          Password:
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className={styles.signup__input}
        />

        <button
          type="submit"
          disabled={loading}
          className={styles.signup__button}
        >
          {loading ? "Registrando..." : "Registrati"}
        </button>
      </form>

      {error && <p className={styles.signup__error}>{error}</p>}
      {message && <p className={styles.signup__message}>{message}</p>}
    </main>
  );
};

export default SignUpForm;
