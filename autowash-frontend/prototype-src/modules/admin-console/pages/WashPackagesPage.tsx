import * as React from "react";
import {
  Car,
  Droplets,
  Gauge,
  Pencil,
  Plus,
  Shield,
  Sparkles,
  Star,
  Trash2,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Service, formatMoney, useCarwashStore } from "@/lib/carwash-store";

const ICONS: Record<string, LucideIcon> = {
  Droplets,
  Sparkles,
  Wind,
  Shield,
  Star,
  Car,
  Gauge,
  Zap,
};

const ICON_OPTIONS = Object.keys(ICONS);

interface DraftState {
  id?: string;
  name: string;
  price: string;
  icon: string;
  status: "ACTIVE" | "INACTIVE";
}

const blankDraft: DraftState = { name: "", price: "", icon: "Droplets", status: "ACTIVE" };

export function WashPackagesPage() {
  const { services, addService, updateService, removeService, hydrated } = useCarwashStore();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DraftState>(blankDraft);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Service | null>(null);

  const openCreate = () => {
    setDraft(blankDraft);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setDraft({
      id: service.id,
      name: service.name,
      price: String(service.price),
      icon: service.icon,
      status: service.status,
    });
    setEditingId(service.id);
    setDialogOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = draft.name.trim();
    if (!trimmedName) {
      toast.error("Package name is required.");
      return;
    }
    const priceNumber = Number(draft.price);
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      toast.error("Price must be a non-negative number.");
      return;
    }
    const duplicate = services.some(
      (service) =>
        service.name.trim().toLowerCase() === trimmedName.toLowerCase() && service.id !== editingId,
    );
    if (duplicate) {
      toast.error("A package with this name already exists.");
      return;
    }

    if (editingId) {
      updateService(editingId, {
        name: trimmedName,
        price: priceNumber,
        icon: draft.icon,
        status: draft.status,
      });
      toast.success(`${trimmedName} updated.`);
    } else {
      addService({
        name: trimmedName,
        price: priceNumber,
        icon: draft.icon,
        status: draft.status,
      });
      toast.success(`${trimmedName} added.`);
    }
    setDialogOpen(false);
    setEditingId(null);
    setDraft(blankDraft);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const result = removeService(deleteTarget.id);
    if (!result.ok) {
      toast.error(result.error ?? "Unable to delete this package.");
    } else {
      toast.success(`${deleteTarget.name} removed.`);
    }
    setDeleteTarget(null);
  };

  const toggleStatus = (service: Service) => {
    const nextStatus = service.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateService(service.id, { status: nextStatus });
    toast.success(`${service.name} marked as ${nextStatus === "ACTIVE" ? "active" : "inactive"}.`);
  };

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md">
              <Droplets className="h-3.5 w-3.5" /> Wash Packages
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Service catalogue
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              Add, edit or retire wash packages. Changes apply immediately to the customer booking
              form and the operations console.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add package
          </Button>
        </div>

        {!hydrated ? (
          <Card className="border-border/50 bg-card/60 p-10 text-center text-sm text-muted-foreground backdrop-blur-xl">
            Loading packages…
          </Card>
        ) : services.length === 0 ? (
          <Card className="border-border/50 bg-card/60 p-10 text-center backdrop-blur-xl">
            <p className="text-sm text-muted-foreground">
              No wash packages yet. Click <strong>Add package</strong> to create the first one.
            </p>
          </Card>
        ) : (
          <Card className="border-border/50 bg-card/70 p-0 shadow-lg backdrop-blur-xl">
            <div className="grid grid-cols-1 divide-y divide-border/50 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = ICONS[service.icon] ?? Sparkles;
                const isActive = service.status === "ACTIVE";
                return (
                  <div
                    key={service.id}
                    className={`flex flex-col gap-3 p-5 md:gap-4 ${
                      isActive ? "bg-primary/5" : "bg-muted/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm ${
                            isActive
                              ? "border-primary/25 bg-primary/10 text-primary"
                              : "border-border/60 bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {service.name}
                          </div>
                          <div className="text-xs font-medium text-muted-foreground">
                            {formatMoney(service.price)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right text-xs text-muted-foreground">
                        <span
                          className={`rounded-full border px-2 py-1 font-semibold ${
                            isActive
                              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                              : "border-zinc-500/25 bg-zinc-500/10 text-zinc-600 dark:text-zinc-300"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 rounded-full px-3 text-xs font-semibold ${
                            isActive
                              ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                              : "border-sky-500/30 text-sky-600 hover:bg-sky-500/10"
                          }`}
                          onClick={() => toggleStatus(service)}
                          aria-label={`${isActive ? "Disable" : "Enable"} ${service.name}`}
                        >
                          {isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(service)}
                          aria-label={`Edit ${service.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-600"
                          onClick={() => setDeleteTarget(service)}
                          aria-label={`Delete ${service.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/80 p-3 text-xs text-muted-foreground shadow-sm dark:bg-background/60">
                      {isActive
                        ? "Visible to customer booking and staff operations."
                        : "Hidden from customer booking while retained for admin use."}
                    </div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      ID <span className="font-mono text-foreground">{service.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setDraft(blankDraft);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit package" : "Add a wash package"}</DialogTitle>
            <DialogDescription>
              Set the name, price (VND) and a display icon. Customers will see the package as soon
              as you save.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="package-name">Name</Label>
              <Input
                id="package-name"
                value={draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. Express Foam Wash"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="package-price">Price (VND)</Label>
              <Input
                id="package-price"
                type="number"
                min={0}
                step={1000}
                value={draft.price}
                onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
                placeholder="120000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="package-status">Status</Label>
              <Select
                value={draft.status}
                onValueChange={(value) =>
                  setDraft((prev) => ({ ...prev, status: value as "ACTIVE" | "INACTIVE" }))
                }
              >
                <SelectTrigger id="package-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Select
                value={draft.icon}
                onValueChange={(value) => setDraft((prev) => ({ ...prev, icon: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((key) => {
                    const Icon = ICONS[key];
                    return (
                      <SelectItem key={key} value={key}>
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          {key}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? "Save changes" : "Create package"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete package</DialogTitle>
            <DialogDescription>
              {deleteTarget ? (
                <>
                  Are you sure you want to delete{" "}
                  <strong className="text-foreground">{deleteTarget.name}</strong>? Active bookings
                  will block deletion.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
