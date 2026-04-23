import ClientLayout from "@/components/ClientLayout";
import { AuthProvider } from "@/providers/auth-provider";
import { AuthGuard } from "@/features/auth/components/auth-guard";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <AuthGuard>
        <ClientLayout>{children}</ClientLayout>
      </AuthGuard>
    </AuthProvider>
  );
}
