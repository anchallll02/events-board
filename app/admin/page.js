import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";
import AdminPanel from "@/components/AdminPanel";

export const metadata = { title: "Admin | Events Board" };

// Runs on the server. A visitor who is not a logged-in admin is sent to the
// admin login page and never receives the panel.
async function AdminGate() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return <AdminPanel />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-slate-500">Loading...</p>}>
      <AdminGate />
    </Suspense>
  );
}