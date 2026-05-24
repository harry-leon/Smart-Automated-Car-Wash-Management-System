import { createFileRoute } from "@tanstack/react-router";
import { OperationsBoardPage } from "@/app/modules/staff-operations/routes";

export const Route = createFileRoute("/staff/operations")({
  component: OperationsBoardPage,
});
