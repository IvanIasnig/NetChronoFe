import { useState } from "react";
import { registerWithEmail } from "@/lib/auth";

export function useSignUpForm() {
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    message,
    loading,
    handleSubmit,
  };
}
