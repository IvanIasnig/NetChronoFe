"use client";

import { registerWithEmail } from "@/lib/auth";
import { useState } from "react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const result = await registerWithEmail(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage(
        "Registrazione avvenuta con successo! Controlla la tua email per confermare."
      );
      setEmail("");
      setPassword("");
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Registrati</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <br />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrati"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </main>
  );
}
