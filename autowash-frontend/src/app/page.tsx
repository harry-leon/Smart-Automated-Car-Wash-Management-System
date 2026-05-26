import { PublicHomePage } from "./components/public/PublicHomePage";
import { I18nProvider } from "@/lib/i18n/context";

function HomePageContent() {
  return <PublicHomePage />;
}

export default function HomePage() {
  return (
    <I18nProvider>
      <HomePageContent />
    </I18nProvider>
  );
}
