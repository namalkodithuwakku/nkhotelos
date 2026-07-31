import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./providers/ThemeProvider";
import PwaManager from "./components/pwa/PwaManager";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "N K Hotel OS", template: "%s | N K Hotel OS" },
  description: "Simple hotel management and business growth platform for boutique hotels, villas and small resorts.",
  applicationName: "N K Hotel OS",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "N K Hotel OS" },
  formatDetection: { telephone: false },
  icons: { icon: "/api/pwa-icon?size=192", apple: "/api/pwa-icon?size=180" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#20252b" },
    { media: "(prefers-color-scheme: dark)", color: "#20252b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.className} ${jakarta.variable}`}>
        <ThemeProvider>{children}<PwaManager /></ThemeProvider>
      </body>
    </html>
  );
}
