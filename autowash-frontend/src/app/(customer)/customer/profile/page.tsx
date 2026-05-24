import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function CustomerProfilePage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Customer profile"
      description="Profile shell for viewing and updating customer account data."
      endpoints={["GET /users/profile", "PUT /users/profile"]}
    />
  );
}
