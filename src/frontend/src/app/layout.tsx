import type { Metadata } from "next";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import AuthProvider from "@/components/auth/AuthProvider";
import "./globals.css";

// Removed font import to avoid issues

export const metadata: Metadata = {
  title: "Schedule Manager - Quản lý thời gian biểu",
  description: "Ứng dụng quản lý thời gian biểu và sự kiện hiệu quả",
  keywords: ["lịch", "quản lý thời gian", "sự kiện", "calendar", "schedule"],
  authors: [{ name: "Schedule Manager Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif' }}>
        <AuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
