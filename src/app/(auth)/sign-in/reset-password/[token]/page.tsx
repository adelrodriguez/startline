import NewPasswordForm from "./_components/NewPasswordForm"

export default function Page({
  params: { token },
}: { params: { token: string } }) {
  return (
    <div>
      <p>Reset password with token {token}</p>
      <NewPasswordForm token={token} />
    </div>
  )
}
