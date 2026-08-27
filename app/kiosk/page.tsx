import { redirect } from "next/navigation";

export default function KioskEntryPage() {
  redirect("/patient/consent?mode=kiosk");
}