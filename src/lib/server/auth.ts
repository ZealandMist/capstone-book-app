import { verifyToken } from "./jwt";
import { cookies } from "next/headers";

export async function getUserFromCookie(
  cookieStore?: Awaited<ReturnType<typeof cookies>>
) {
  try {
    const store = cookieStore ?? (await cookies());
    const token = store.get("token")?.value;

    if (!token) return null;

    return verifyToken(token);
  } catch (err) {
    console.error("Invalid token or cookie error:", err);
    return null;
  }
}
