// app/protected-page/layout.tsx
"use client";

import AuthWrapper from "@/components/Wrapper";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthWrapper>{children}</AuthWrapper>;
}
