import { apiRequest } from "@/lib/api";
import type {
  CheckInWashSessionResponse,
  CompleteWashSessionResponse,
  OperationsQueue,
  QueueWashSessionResponse,
  StartWashSessionResponse,
} from "@/types/operation.types";

const SESSION_BASE_URL = "/operations/sessions";

export function getOperationsQueue() {
  return apiRequest<OperationsQueue>({
    method: "GET",
    url: "/operations/queue",
  });
}

export function queueWashSession(sessionId: string) {
  return apiRequest<QueueWashSessionResponse>({
    method: "POST",
    url: `${SESSION_BASE_URL}/${sessionId}/queue`,
  });
}

export function checkInWashSession(sessionId: string) {
  return apiRequest<CheckInWashSessionResponse>({
    method: "POST",
    url: `${SESSION_BASE_URL}/${sessionId}/check-in`,
  });
}

export function startWashSession(sessionId: string) {
  return apiRequest<StartWashSessionResponse>({
    method: "POST",
    url: `${SESSION_BASE_URL}/${sessionId}/start`,
  });
}

export function completeWashSession(sessionId: string) {
  return apiRequest<CompleteWashSessionResponse>({
    method: "POST",
    url: `${SESSION_BASE_URL}/${sessionId}/complete`,
  });
}
