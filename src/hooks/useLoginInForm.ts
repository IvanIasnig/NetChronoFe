import { useState } from "react";
import { loginWithEmail } from "@/lib/auth";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await loginWithEmail(email, password);

    if (error) {
      setErrorMsg(error);
    } else {
      alert("Login effettuato!");
    }

    setLoading(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    errorMsg,
    loading,
    handleLogin,
  };
}
