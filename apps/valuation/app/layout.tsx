import type { Metadata } from "next";
import "./globals.css";
import { NavBar, Footer, Logo } from "@evolution/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Evolution Valuation - ROI & Financial Modeling",
  description: "Calculate returns, model scenarios, and visualize syndicate performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logo = (
    <Link href="/">
      <div className="flex items-center gap-3">
        <Logo variant="icon" size="md" />
        <div>
          <span className="text-xl font-bold text-primary">Evolution</span>
          <span className="text-xl font-light text-foreground"> Valuation</span>
        </div>
      </div>
    </Link>
  );

  const navItems = [
    { href: "/calculator", label: "ROI Calculator" },
    { href: "/scenarios", label: "Scenarios" },
    { href: "/reports", label: "Reports" },
    { href: "/compare", label: "Compare" },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <NavBar logo={logo} navItems={navItems} />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
