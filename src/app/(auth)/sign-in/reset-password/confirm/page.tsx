import { RESET_PASSWORD_URL } from "@/lib/consts"
import { redirect } from "next/navigation"

export default function Page({
  searchParams: { to },
}: { searchParams: { to: string } }) {
  if (!to) {
    redirect(RESET_PASSWORD_URL)
  }

  return (
    <div>
      <p>Sent a reset password email to {to}. Please check your email.</p>
    </div>
  )
}
