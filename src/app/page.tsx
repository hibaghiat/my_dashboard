import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { Sidebar } from "@/components/Sidebar/Sidebar";

export default function Home() {
  const cookieStore = cookies();
  const auth = cookieStore.get("auth");

  if (!auth || auth.value !== "true") {
    redirect("/login");
  }

  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
      <Sidebar />
      <Dashboard />
    </main>
  );
}
