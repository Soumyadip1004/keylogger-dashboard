import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { geistMono, geistSans } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: "Keylogger Dashboard",
    template: "%s | Keylogger Dashboard",
  },
  description:
    "Monitor and view captured keystrokes from connected devices in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
