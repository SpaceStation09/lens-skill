import { AppLayout } from "../../components/shell/AppLayout";
import { PageContainer } from "../../components/shell/PageContainer";

export function AuthPageShell() {
  return (
    <AppLayout title="Connect Your Lens Blog">
      <PageContainer>
        <section className="card-stack">
          <div className="card">
            <h2>Wallet</h2>
            <p>Show wallet connection state and connected address here.</p>
          </div>
          <div className="card">
            <h2>Lens account</h2>
            <p>Offer create-account and login actions for the current wallet.</p>
          </div>
          <div className="card">
            <h2>Session feedback</h2>
            <p>Render loading, success, and error feedback for auth flows.</p>
          </div>
        </section>
      </PageContainer>
    </AppLayout>
  );
}
