import { AdminLoginForm } from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-10 pb-10 bg-[rgb(15,23,42)] px-4">
      <AdminLoginForm />
    </div>
  );
}
