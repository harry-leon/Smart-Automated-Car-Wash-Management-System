import * as React from "react";
import { Bell, MessageCircle, Send, Shield, UserRound, Wrench, X } from "lucide-react";
import { type Role, useCarwashStore } from "@/shared/store/carwash-store";
import { cn } from "@/shared/lib/utils";

function formatMessageTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--:--";
  return parsed.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function SupportChatWidget({ role }: { role: Role }) {
  const {
    currentCustomerId,
    currentStaffId,
    customers,
    staffMembers,
    supportThreads,
    ensureSupportThread,
    sendSupportMessage,
    markSupportThreadRead,
  } = useCarwashStore();

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null);

  const threads = React.useMemo(() => {
    const safeThreads = Array.isArray(supportThreads) ? supportThreads : [];
    return safeThreads
      .filter((thread) => thread && typeof thread.customerId === "string")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [supportThreads]);

  const customerThread = React.useMemo(() => {
    if (role !== "Customer" || !currentCustomerId) return null;
    return threads.find((thread) => thread.customerId === currentCustomerId) ?? null;
  }, [currentCustomerId, role, threads]);

  const activeThread = React.useMemo(() => {
    if (role === "Customer") return customerThread;
    const targetCustomerId = selectedCustomerId ?? threads[0]?.customerId ?? null;
    if (!targetCustomerId) return null;
    return threads.find((thread) => thread.customerId === targetCustomerId) ?? null;
  }, [customerThread, role, selectedCustomerId, threads]);

  const unreadCount = React.useMemo(() => {
    if (role === "Customer") return customerThread?.unreadForCustomer ?? 0;
    return threads.reduce((sum, thread) => sum + (thread.unreadForStaff ?? 0), 0);
  }, [customerThread, role, threads]);

  React.useEffect(() => {
    if (!open || role !== "Customer" || !currentCustomerId) return;
    ensureSupportThread(currentCustomerId);
  }, [currentCustomerId, ensureSupportThread, open, role]);

  React.useEffect(() => {
    if (!open || !activeThread) return;
    markSupportThreadRead(activeThread.customerId, role === "Customer" ? "Customer" : role);
  }, [activeThread, markSupportThreadRead, open, role]);

  React.useEffect(() => {
    if (role === "Customer") return;
    if (!selectedCustomerId && threads[0]?.customerId) {
      setSelectedCustomerId(threads[0].customerId);
    }
  }, [role, selectedCustomerId, threads]);

  const senderName =
    role === "Customer"
      ? (customers.find((customer) => customer.id === currentCustomerId)?.name ?? "Customer")
      : role === "Staff"
        ? (staffMembers.find((staff) => staff.id === currentStaffId)?.name ?? "Staff")
        : "Admin User";

  const messages = Array.isArray(activeThread?.messages) ? activeThread.messages : [];
  const canSend =
    draft.trim().length > 0 &&
    ((role === "Customer" && Boolean(currentCustomerId)) ||
      (role !== "Customer" && Boolean(activeThread?.customerId)));

  const handleSend = () => {
    const targetCustomerId = role === "Customer" ? currentCustomerId : activeThread?.customerId;
    if (!targetCustomerId || !draft.trim()) return;

    sendSupportMessage({
      customerId: targetCustomerId,
      senderRole: role,
      senderName,
      body: draft.trim(),
    });
    setDraft("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-transform hover:scale-105"
        aria-label="Open support chat"
        title="Open support chat"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[81] bg-black/20"
            onClick={() => setOpen(false)}
            aria-label="Close support chat overlay"
          />

          <section className="fixed bottom-24 right-6 z-[82] flex h-[560px] w-[min(880px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            {role !== "Customer" && (
              <aside className="hidden w-[280px] border-r border-slate-200 bg-slate-50 lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Support inbox
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {threads.length} conversation(s)
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                  {threads.length === 0 ? (
                    <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      Chua co tin nhan tu customer.
                    </div>
                  ) : (
                    threads.map((thread) => {
                      const lastMessage =
                        Array.isArray(thread.messages) && thread.messages.length > 0
                          ? thread.messages[thread.messages.length - 1]
                          : null;

                      return (
                        <button
                          key={thread.id}
                          type="button"
                          onClick={() => setSelectedCustomerId(thread.customerId)}
                          className={cn(
                            "mb-2 w-full rounded-xl border px-3 py-3 text-left transition",
                            activeThread?.id === thread.id
                              ? "border-primary/40 bg-primary/10"
                              : "border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate font-medium text-slate-900 dark:text-slate-100">
                              {thread.customerName}
                            </div>
                            {thread.unreadForStaff > 0 && (
                              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                {thread.unreadForStaff}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {lastMessage?.body ?? "No messages"}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {role === "Customer" ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : role === "Staff" ? (
                      <Wrench className="h-4 w-4 text-primary" />
                    ) : (
                      <Shield className="h-4 w-4 text-primary" />
                    )}
                    {role === "Customer"
                      ? "Ho tro nhanh"
                      : activeThread
                        ? `Chat voi ${activeThread.customerName}`
                        : "Support chat"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {role === "Customer"
                      ? "Nhan vien se thay tin nhan cua ban va co the tra loi ngay."
                      : "Tat ca staff deu co the xem va phan hoi hoi thoai nay."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  aria-label="Close support chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-4 py-4 dark:bg-slate-900/60">
                {!activeThread ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    {role === "Customer" ? "Dang mo ho tro..." : "Chua co tin nhan tu customer."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const mine =
                        (role === "Customer" && message.senderRole === "Customer") ||
                        (role !== "Customer" &&
                          (message.senderRole === "Staff" || message.senderRole === "Admin"));

                      return (
                        <div
                          key={message.id}
                          className={cn("flex", mine ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[82%] rounded-2xl px-4 py-3 shadow-sm",
                              mine
                                ? "bg-primary text-white"
                                : message.senderRole === "System"
                                  ? "border border-primary/20 bg-primary/10 text-slate-900 dark:text-slate-100"
                                  : "border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
                            )}
                          >
                            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold opacity-80">
                              {message.senderRole === "System" ? (
                                <Bell className="h-3 w-3" />
                              ) : (
                                <UserRound className="h-3 w-3" />
                              )}
                              <span>{message.senderName}</span>
                            </div>
                            <div className="whitespace-pre-wrap text-sm leading-6">
                              {message.body}
                            </div>
                            <div className="mt-1 text-[10px] opacity-70">
                              {formatMessageTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-end gap-3">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={
                      role === "Customer"
                        ? "Nhap noi dung can ho tro..."
                        : "Nhap phan hoi cho customer..."
                    }
                    className="min-h-[76px] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Gui
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
