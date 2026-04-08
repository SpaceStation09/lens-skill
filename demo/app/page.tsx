"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeFrame } from "../theme/default/templates/ThemeFrame";
import { useLensAuth } from "../providers/lens-auth-context";

export default function HomePage() {
  const router = useRouter();
  const { session, connectedWallet, walletChecking, loading } = useLensAuth();

  useEffect(() => {
    if (loading) return;

    if (session?.handle) {
      router.replace(`/profile/${session.handle}`);
      return;
    }

    if (connectedWallet) {
      router.replace("/auth");
    }
  }, [loading, session, connectedWallet, router]);

  return (
    <ThemeFrame
      nav={[
        { label: "Home", href: "/", active: true },
        { label: "Sign In", href: "/auth" },
        { label: "Write", href: "/compose" },
      ]}
      footer={[{ label: "Profile", href: session?.handle ? `/profile/${session.handle}` : "/auth" }]}
      connectedWallet={connectedWallet}
      walletChecking={walletChecking}
      lensHandle={session?.handle ?? null}
      lensAccountAddress={session?.accountAddress ?? null}
    >
      <section className="section-heading">
        <span>Get Started</span>
      </section>
      <section className="essay-list">
        <article className="essay-card">
          <p className="essay-card__meta">Step 1</p>
          <h3>Connect wallet and sign in</h3>
          <p className="essay-card__excerpt">Use Privy to connect your wallet and select your Lens account.</p>
          <Link href="/auth" className="essay-card__link">Open sign in</Link>
        </article>
        <article className="essay-card">
          <p className="essay-card__meta">Step 2</p>
          <h3>Write and publish</h3>
          <p className="essay-card__excerpt">Create a post in Markdown and publish it to Lens.</p>
          <Link href="/compose" className="essay-card__link">Open editor</Link>
        </article>
      </section>
    </ThemeFrame>
  );
}
