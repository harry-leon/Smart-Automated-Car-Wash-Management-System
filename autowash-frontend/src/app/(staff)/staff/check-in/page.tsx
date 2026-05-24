import { WorkspacePlaceholder } from "@/app/_components/workspace-placeholder";

export default function StaffCheckInPage() {
  return (
    <WorkspacePlaceholder
      workspace="Staff"
      title="Check-in"
      description="License plate check-in shell for staff wash session intake."
      endpoints={["POST /operations/wash-sessions/:sessionId/check-in"]}
    />
  );
}
