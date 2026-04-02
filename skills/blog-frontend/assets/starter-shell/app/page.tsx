import { redirect } from "next/navigation";

// Replace this with real session/profile resolution when wiring lens-interaction.
const hasActiveProfile = false;

export default function HomePage() {
  if (hasActiveProfile) {
    redirect("/profile/demo");
  }

  redirect("/auth");
}
