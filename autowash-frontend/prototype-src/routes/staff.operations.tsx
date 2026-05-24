import { createFileRoute } from "@tanstack/react-router";
import { OperationsBoardPage } from "@/modules/staff-operations/routes";

export const Route = createFileRoute("/staff/operations")({
  component: OperationsBoardPage,
});
