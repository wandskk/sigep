import { Metadata } from "next";
import { LoginPageWrapper } from "@/components/auth/LoginPageWrapper";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Faça login no SIGEP",
};

export default function LoginPage() {
  return <LoginPageWrapper />;
}
