import { useTranslations } from "next-intl"

export default function Page() {
  const t = useTranslations()

  return (
    <div>
      <h1>{t("home.title")}</h1>
      <p>{t("home.description")}</p>
    </div>
  )
}
