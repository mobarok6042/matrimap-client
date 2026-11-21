import { ProfileList } from "@/components/profile-list";

export const metadata = {
  title: "Matrimony profiles",
};

export default function ProfilesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Community profiles</h1>
      <p className="mt-2 mb-8 text-muted-foreground">
        A public list read from <code className="text-sm">GET /api/profiles</code>.
      </p>
      <ProfileList />
    </main>
  );
}
