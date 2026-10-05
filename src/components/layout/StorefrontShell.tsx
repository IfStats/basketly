"use client";

import { usePathname } from "next/navigation";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAdmin =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isCheckout =
    pathname === "/checkout";

  /*
   * Admin has its own AdminShell.
   * Checkout intentionally uses a reduced,
   * distraction-free commerce layout.
   */
  if (isAdmin || isCheckout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />

      <div className="min-h-[60vh]">
        {children}
      </div>

      <Footer />
    </>
  );
}