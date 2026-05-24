import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Crown,
  Loader2,
  Sparkles,
  TrendingUp,
  User,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  MessageSquare,
  History,
  Edit2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nextTierInfo, usePortal } from "@/lib/portal-store";
import { RouteRedirect } from "@/components/route-redirect";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIER_GRADIENT: Record<string, string> = {
  Member: "from-amber-700 via-amber-600 to-orange-500",
  Silver: "from-slate-500 via-slate-400 to-zinc-400",
  Gold: "from-yellow-600 via-amber-500 to-yellow-400",
  Platinum: "from-indigo-600 via-violet-500 to-fuchsia-500",
};

export function ProfilePage() {
  const { profile, updateProfile } = usePortal();
  const [name, setName] = React.useState(profile?.name ?? "");
  const [email, setEmail] = React.useState(profile?.email ?? "");
  const [phone, setPhone] = React.useState(profile?.phone ?? "");
  const [countryCode, setCountryCode] = React.useState(profile?.countryCode ?? "+84");
  const [status, setStatus] = React.useState<"Active" | "Inactive" | "Blocked">(
    profile?.status ?? "Active",
  );
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone);
      setCountryCode(profile.countryCode);
      setStatus(profile.status);
    }
  }, [profile]);

  if (!profile) {
    return <div className="p-10 text-center text-muted-foreground">No profile loaded.</div>;
  }

  const tierInfo = nextTierInfo(profile.points, profile.tier);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error("Name cannot be empty");
    }
    if (!email.trim() || !email.includes("@")) {
      return toast.error("Please enter a valid email address");
    }
    if (!/^\d{8,11}$/.test(phone.trim())) {
      return toast.error("Phone must be 8-11 digits");
    }
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      countryCode,
      status,
    });
    setSaving(false);
    setIsEditing(false);
    toast.success("Profile updated");
  };

  return (
    <div className="px-4 py-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto w-full max-w-3xl">
        <form
          onSubmit={handleSave}
          className="overflow-hidden rounded-[2rem] border border-border/50 bg-card/60 backdrop-blur-xl shadow-xl"
        >
          <div className="p-8">
            {!isEditing ? (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight">Personal information</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl font-semibold gap-2 border-primary/20 text-primary hover:bg-primary/5 h-9"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            ) : (
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight">Edit information</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your personal details below.
                </p>
              </div>
            )}

            {!isEditing ? (
              <div className="flex flex-col divide-y divide-border/40">
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Full Name</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground">{profile.name}</div>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Phone Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {profile.countryCode}{" "}
                      {profile.phone.replace(/(\d{3})(\d{3})(\d+)/, "$1 $2 $3")}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{profile.email}</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Joined Date</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground">15 Feb 2025</div>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Account Status</span>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm",
                      profile.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : profile.status === "Blocked"
                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                    )}
                  >
                    {profile.status}
                  </span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">Preferred Contact</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground">SMS & Email</div>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <History className="h-4 w-4" />
                    <span className="text-sm font-medium">Last Activity</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    Car Wash • 14 Aug 2026
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="pname"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Full name
                  </Label>
                  <Input
                    id="pname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="h-12 rounded-xl bg-background/50 border-border/60 transition-all focus-visible:ring-primary/30 focus-visible:border-primary font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pphone"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Phone
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={!isEditing}
                      className="h-12 rounded-xl border border-border/60 bg-background/50 px-3 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <option value="+84">+84</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+65">+65</option>
                    </select>
                    <Input
                      id="pphone"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      disabled={!isEditing}
                      className="h-12 flex-1 rounded-xl bg-background/50 border-border/60 transition-all focus-visible:ring-primary/30 focus-visible:border-primary font-medium tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pemail"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Email
                  </Label>
                  <Input
                    id="pemail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="h-12 rounded-xl bg-background/50 border-border/60 transition-all focus-visible:ring-primary/30 focus-visible:border-primary font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Account Status
                  </Label>
                  <div className="flex h-12 items-center rounded-xl bg-background/30 border border-border/60 px-3 shadow-sm cursor-not-allowed">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm",
                        status === "Active"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : status === "Blocked"
                            ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                      )}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end border-t border-border/50 bg-accent/10 px-8 py-5 backdrop-blur-md">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    if (profile) {
                      setName(profile.name);
                      setEmail(profile.email);
                      setPhone(profile.phone);
                      setCountryCode(profile.countryCode);
                    }
                  }}
                  className="rounded-xl px-6 h-11 font-bold border-border/60 hover:bg-background transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl px-8 h-11 font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
