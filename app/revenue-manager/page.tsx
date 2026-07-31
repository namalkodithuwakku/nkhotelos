import RevenueManagerWorkspace from "../components/revenue/RevenueManagerWorkspace";
import OSProtectedPage from "../components/os/OSProtectedPage";

export default function RevenueManagerPage() {
  return (
    <OSProtectedPage
      eyebrow="N K Hotel OS"
      title="Revenue Manager"
      fullWidth
    >
      <RevenueManagerWorkspace />
    </OSProtectedPage>
  );
}
