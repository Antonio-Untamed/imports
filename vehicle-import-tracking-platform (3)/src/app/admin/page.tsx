import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin-console";
import { BRAND } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin console — Bandari Motors",
  description: "Publish and manage units on sale, set KRA CRSP values, and read callback requests.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      <AdminConsole />
      <p className="mt-8 border-t border-ink/10 pt-4 font-mono text-[11px] text-ink/40">
        Callback requests route to {BRAND.phone} · {BRAND.email}
      </p>
    </div>
  );
}
