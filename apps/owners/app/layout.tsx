import type { Metadata } from "next";
import "./globals.css";
import { NavBar, Footer, Logo } from "@evolution/ui";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Evolution Owners - Horse Registration & Management",
  description: "Register your horses and manage ownership with Evolution Stables",
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
          <span className="text-xl font-light text-foreground"> Owners</span>
        </div>
      </div>
    </Link>
  );

  const navItems = [
    { href: "/register", label: "Register Horse" },
    { href: "/dashboard", label: "My Horses" },
    { href: "/syndicates", label: "Syndicates" },
    { href: "/documents", label: "Documents" },
  ];

  return (
    <html lang="en">
      <body className="antialiased bg-surface text-foreground">
        <NavBar logo={logo} navItems={navItems} />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
