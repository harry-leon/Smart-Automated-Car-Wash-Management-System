import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Car, CarFront, Truck, Bike, Pencil, Trash2, Plus, X, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePortal, VEHICLE_TYPES, Vehicle, VehicleType } from "@/lib/portal-store";
import { RouteRedirect } from "@/components/route-redirect";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vehicles")({
  component: () => <RouteRedirect to="/customer/vehicles" />,
});

const TYPE_ICONS: Record<VehicleType, React.ComponentType<{ className?: string }>> = {
  Sedan: Car,
  SUV: CarFront,
  Truck: Truck,
  Motorbike: Bike,
};

const COLOR_IMAGES: Record<string, string> = {
  White:
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=200&h=120",
  Black:
    "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=200&h=120",
  Gray: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=200&h=120",
  Red: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=200&h=120",
  Blue: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=200&h=120",
};

const TYPE_COLORS: Record<VehicleType, string> = {
  Sedan: "Red",
  SUV: "White",
  Truck: "Gray",
  Motorbike: "Black",
};

export function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = usePortal();
  const [editing, setEditing] = React.useState<Vehicle | "new" | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  return (
    <div className="px-4 py-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
              My vehicles
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Save your vehicles for faster check-in at every wash.
            </p>
          </div>
          <Button
            onClick={() => setEditing("new")}
            className="rounded-xl h-11 px-6 font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add vehicle
          </Button>
        </div>

        {vehicles.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-border/60 bg-card/40 p-12 text-center backdrop-blur-xl shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-indigo-500/10 text-primary shadow-inner">
              <Car className="h-10 w-10 opacity-80" />
            </div>
            <h3 className="mt-6 text-lg font-bold tracking-tight">No vehicles found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              You haven't added any vehicles yet. Add your first one to get started with booking.
            </p>
            <Button
              variant="outline"
              className="mt-6 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-semibold"
              onClick={() => setEditing("new")}
            >
              Add your first vehicle
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {vehicles.map((v, index) => {
              const Icon = TYPE_ICONS[v.type];
              return (
                <div
                  key={v.id}
                  className="group relative flex items-center justify-between rounded-xl border border-border/60 bg-background/50 p-4 transition-all hover:bg-accent/30 shadow-sm"
                >
                  {index === 0 && (
                    <div className="absolute -top-2.5 left-4 inline-flex items-center rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800 shadow-sm z-10">
                      Default
                    </div>
                  )}

                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
                      {/* Use color specific images */}
                      <img
                        src={COLOR_IMAGES[v.color || TYPE_COLORS[v.type]] || COLOR_IMAGES["White"]}
                        alt={v.brandModel}
                        className="absolute inset-0 h-full w-full object-cover mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <div className="text-[15px] font-extrabold text-foreground tracking-tight">
                        {v.plate}
                      </div>
                      <div className="mt-0.5 text-[13px] text-muted-foreground font-medium">
                        {v.brandModel}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground/80">
                        {v.type} · {v.color || TYPE_COLORS[v.type]}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Keep Edit/Delete actions but style them as small icons or hide them behind a More menu. For now, just show icons on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mr-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                        onClick={() => setEditing(v)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteId(v.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors self-start sm:self-center">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <VehicleDialog
        editing={editing}
        onClose={() => setEditing(null)}
        onSave={(data) => {
          try {
            if (editing === "new") {
              addVehicle(data);
              toast.success("Vehicle added");
            } else if (editing) {
              updateVehicle(editing.id, data);
              toast.success("Vehicle updated");
            }
            setEditing(null);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save vehicle.");
          }
        }}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2rem] border-border/50 bg-card/90 backdrop-blur-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Remove this vehicle?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This vehicle will be removed from your account. You can re-add it anytime later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteId) return;
                const result = deleteVehicle(deleteId);
                if (result.ok) {
                  toast.success("Vehicle removed");
                } else {
                  toast.error(result.error);
                }
                setDeleteId(null);
              }}
              className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md shadow-destructive/20"
            >
              Delete Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function VehicleDialog({
  editing,
  onClose,
  onSave,
}: {
  editing: Vehicle | "new" | null;
  onClose: () => void;
  onSave: (data: Omit<Vehicle, "id">) => void;
}) {
  const isEditing = editing && editing !== "new";
  const v = isEditing ? (editing as Vehicle) : null;

  const [brandModel, setBrandModel] = React.useState("");
  const [plate, setPlate] = React.useState("");
  const [type, setType] = React.useState<VehicleType>("Sedan");
  const [color, setColor] = React.useState<string>("White");

  React.useEffect(() => {
    if (editing && editing !== "new") {
      setBrandModel(editing.brandModel);
      setPlate(editing.plate);
      setType(editing.type);
      setColor(editing.color || "White");
    } else if (editing === "new") {
      setBrandModel("");
      setPlate("");
      setType("Sedan");
      setColor("White");
    }
  }, [editing]);

  const COLORS = ["White", "Black", "Gray", "Red", "Blue"];
  const COLOR_CLASSES: Record<string, string> = {
    White: "bg-white border-slate-200",
    Black: "bg-neutral-900 border-neutral-900",
    Gray: "bg-slate-500 border-slate-500",
    Red: "bg-red-600 border-red-600",
    Blue: "bg-blue-600 border-blue-600",
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandModel.trim()) {
      toast.error("Enter brand & model");
      return;
    }
    if (plate.trim().length < 4) {
      toast.error("Plate looks too short");
      return;
    }
    onSave({ brandModel: brandModel.trim(), plate: plate.trim().toUpperCase(), type, color });
  };

  return (
    <Dialog open={editing !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-border/50 bg-card/90 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold">
              {v ? "Edit vehicle" : "Add vehicle"}
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {v
                ? "Update the details for this vehicle."
                : "Register a new vehicle on your account."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="vbrand"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Brand & model
              </Label>
              <Input
                id="vbrand"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="Honda CR-V"
                className="h-12 rounded-xl bg-background/50 border-border/60 transition-all focus-visible:ring-primary/30 focus-visible:border-primary font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="vplate"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                License plate
              </Label>
              <Input
                id="vplate"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="51K-678.90"
                className="h-12 rounded-xl bg-background/50 border-border/60 transition-all focus-visible:ring-primary/30 focus-visible:border-primary font-mono uppercase tracking-widest text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Vehicle type
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {VEHICLE_TYPES.map((t) => {
                  const Icon = TYPE_ICONS[t];
                  const active = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "group flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all duration-300",
                        active
                          ? "border-primary bg-primary/10 shadow-md shadow-primary/10 ring-1 ring-primary/30"
                          : "border-border/60 bg-background/40 hover:border-primary/40 hover:bg-accent/40 hover:-translate-y-0.5",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-xl p-2 transition-colors",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={cn(
                          "text-xs font-bold",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {t}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Color
              </Label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-10 w-10 rounded-full border-2 transition-all",
                      COLOR_CLASSES[c],
                      color === c
                        ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-md"
                        : "hover:scale-105 opacity-80",
                    )}
                    title={c}
                  />
                ))}
              </div>
            </div>
            <DialogFooter className="mt-8 gap-3 sm:gap-0 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="rounded-xl font-semibold hover:bg-accent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl font-bold shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all"
              >
                {v ? "Save changes" : "Add vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
