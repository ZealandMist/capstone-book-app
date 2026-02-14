import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/lib/server/auth";


export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
