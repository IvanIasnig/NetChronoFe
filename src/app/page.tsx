import HomeSpeed from "@/components/HomeSpeed";
import { LoginForm } from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

export default function Home() {
  return (
    <div>
      <LoginForm />
      <br />
      <RegisterForm />
      <br />
      <HomeSpeed />
    </div>
  );
}
