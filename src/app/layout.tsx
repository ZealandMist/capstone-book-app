import { AuthProvider } from "@/context/AuthContext";
import AppNav from "@/app/components/AppNav";
import "bootstrap/dist/css/bootstrap.min.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppNav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
