import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const isLoggedIn = !!session.userId;

  // Not logged in (e.g. /patient/login) — render children directly with no wrapper
  if (!isLoggedIn) {
    return <>{children}</>;
  }

  // For all logged-in patient routes, render children in a plain full-height container.
  // Each individual page (dashboard, consent, interview, review…) owns its own header.
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {children}
    </div>
  );
}