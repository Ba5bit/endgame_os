import { AuthForm } from "@/components/auth/AuthForm";
import { AppHeader } from "@/components/product/AppHeader";

export default function AuthPage() {
  return (
    <div className="min-h-screen">
      <AppHeader active="auth" />
      <main className="px-4 py-8">
        <AuthForm />
      </main>
    </div>
  );
}
