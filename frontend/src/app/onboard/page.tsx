import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function OnboardIndex() {
  const cookieStore = await cookies();
  const isOnboarded = cookieStore.get("metaphor_onboarded")?.value === "true";
  const isUnlocked = cookieStore.get("metaphor_unlocked")?.value === "true";
  if (isOnboarded || isUnlocked) {
    redirect("/world");
  }
  redirect("/onboard/step-1");
}
