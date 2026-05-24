import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function CustomerHomePage() {
  return (
    <WorkspacePlaceholder
      workspace="Customer"
      title="Customer home"
      description="Customer dashboard shell with live wash tracking slot and account summary."
      endpoints={[
        "GET /customers/profile",
        "GET /customers/wash-tracking/active",
        "GET /customers/wash-tracking/:washSessionId"
      ]}
      links={[
        { href: "/customer/bookings/new", label: "New booking" },
        { href: "/customer/vehicles", label: "Vehicles" },
        { href: "/customer/loyalty", label: "Loyalty" }
      ]}
    />
  );
}
