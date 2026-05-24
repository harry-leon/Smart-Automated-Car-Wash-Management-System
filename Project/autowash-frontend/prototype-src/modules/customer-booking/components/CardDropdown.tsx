import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Clock, Car, Sparkles, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// 1. Reusable Generic Dropdown Component
// ============================================================================

interface CardDropdownProps<T> {
  label: string;
  items: T[];
  selectedItem: T;
  onSelect: (item: T) => void;
  renderItemContent: (item: T, isCompact?: boolean) => React.ReactNode;
  getKey: (item: T) => string;
}

export function CardDropdown<T>({
  label,
  items,
  selectedItem,
  onSelect,
  renderItemContent,
  getKey,
}: CardDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter out the currently selected item from the dropdown list
  const otherItems = items.filter((item) => getKey(item) !== getKey(selectedItem));

  return (
    <div className="flex flex-col gap-2 w-full" ref={dropdownRef}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>

      {/* Dropdown Header (Active Selected Card) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full text-left relative overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-sm transition-all duration-300",
            "border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20",
            "hover:shadow-md cursor-pointer",
            isOpen && "shadow-lg border-blue-700",
          )}
        >
          {/* Active selection corner triangle */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-l-[24px] border-t-blue-600 border-l-transparent" />

          <div className="flex justify-between items-center pr-6">
            <div className="flex-1">{renderItemContent(selectedItem, false)}</div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-slate-400 transition-transform duration-300 ml-4 flex-shrink-0",
                isOpen && "transform rotate-180 text-blue-600",
              )}
            />
          </div>
        </button>
      </div>

      {/* Dropdown Options (Collapsible Grid using CSS grid transition) */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen
            ? "grid-rows-[1fr] opacity-100 mt-2"
            : "grid-rows-[0fr] opacity-0 pointer-events-none",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 p-1 max-h-[350px] overflow-y-auto">
            {otherItems.map((item) => (
              <button
                key={getKey(item)}
                type="button"
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200",
                  "border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 hover:shadow",
                  "cursor-pointer",
                )}
              >
                {renderItemContent(item, false)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. Specialized Content Renderers & Types
// ============================================================================

// --- VEHICLE ---
export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  vehicleType: string;
  color: string;
  isDefault?: boolean;
}

export function VehicleCardContent({
  vehicle,
  isCompact = false,
}: {
  vehicle: Vehicle;
  isCompact?: boolean;
}) {
  return (
    <div className="flex justify-between items-center w-full gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <strong className="text-base font-bold text-slate-800">
            {vehicle.brand} {vehicle.model}
          </strong>
          {vehicle.isDefault && (
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-green-100 text-green-800 uppercase">
              Default
            </span>
          )}
        </div>
        <div className="text-sm text-slate-500">
          {vehicle.vehicleType} • {vehicle.color}
        </div>
      </div>

      {/* License plate styled border box */}
      <div className="flex-shrink-0">
        <div className="inline-flex border-2 border-slate-800 rounded-lg px-3.5 py-1.5 bg-slate-50 text-slate-900 text-sm font-extrabold tracking-wider shadow-sm uppercase">
          {vehicle.licensePlate}
        </div>
      </div>
    </div>
  );
}

// --- WASH PACKAGE ---
export interface WashPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  highlights: string[];
  recommendedFor: string;
}

export function PackageCardContent({
  pkg,
  isCompact = false,
}: {
  pkg: WashPackage;
  isCompact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <strong className="text-base font-bold text-slate-800">{pkg.name}</strong>
          <span className="inline-flex items-center text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            <Clock className="mr-1 h-3.5 w-3.5" />
            {pkg.durationMinutes} mins
          </span>
        </div>
        <span className="text-base font-extrabold text-blue-600">
          {pkg.price.toLocaleString()} VND
        </span>
      </div>

      {!isCompact && (
        <>
          <p className="text-sm text-slate-500 leading-relaxed">{pkg.description}</p>

          {pkg.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pkg.highlights.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="text-xs text-slate-400 italic border-t border-slate-100 pt-2.5 mt-1">
            Best for: {pkg.recommendedFor}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// 3. Demo Component Showing Integration
// ============================================================================

export function ReusableCardSelectorDemo() {
  // Mock Data
  const vehicles: Vehicle[] = [
    {
      id: "veh-001",
      licensePlate: "51G-246.80",
      brand: "Toyota",
      model: "Camry",
      vehicleType: "Sedan",
      color: "Black",
      isDefault: true,
    },
    {
      id: "veh-002",
      licensePlate: "51H-888.19",
      brand: "Honda",
      model: "CR-V",
      vehicleType: "SUV",
      color: "White",
      isDefault: false,
    },
    {
      id: "veh-003",
      licensePlate: "60A-112.35",
      brand: "Ford",
      model: "Ranger",
      vehicleType: "Pickup",
      color: "Gray",
      isDefault: false,
    },
  ];

  const washPackages: WashPackage[] = [
    {
      id: "pkg-express",
      name: "Express Exterior",
      description: "Fast foam wash, rinse, dry, tire shine, and glass finish.",
      price: 90000,
      durationMinutes: 25,
      highlights: ["Foam wash", "Tire shine", "Quick dry"],
      recommendedFor: "Weekly maintenance",
    },
    {
      id: "pkg-premium",
      name: "Premium In-Out",
      description: "Exterior wash plus vacuuming, dashboard wipe, and interior fragrance.",
      price: 160000,
      durationMinutes: 45,
      highlights: ["Exterior wash", "Interior vacuum", "Fragrance"],
      recommendedFor: "Family cars",
    },
    {
      id: "pkg-detail",
      name: "Detail Refresh",
      description: "Careful exterior wash, wax boost, rim care, cabin vacuum, and leather wipe.",
      price: 260000,
      durationMinutes: 75,
      highlights: ["Wax boost", "Rim care", "Leather wipe"],
      recommendedFor: "Before trips or events",
    },
  ];

  // States
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(vehicles[0]);
  const [selectedPackage, setSelectedPackage] = useState<WashPackage>(washPackages[0]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col gap-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">Booking Configuration Demo</h2>
        <p className="text-sm text-slate-500 mt-1">
          Click on any card dropdown to choose another option.
        </p>
      </div>

      {/* Vehicle Dropdown */}
      <CardDropdown<Vehicle>
        label="Chọn Xe (Vehicle Selector)"
        items={vehicles}
        selectedItem={selectedVehicle}
        onSelect={setSelectedVehicle}
        getKey={(vehicle) => vehicle.id}
        renderItemContent={(vehicle, isCompact) => (
          <VehicleCardContent vehicle={vehicle} isCompact={isCompact} />
        )}
      />

      {/* Package Dropdown */}
      <CardDropdown<WashPackage>
        label="Gói Rửa Xe (Wash Package Selector)"
        items={washPackages}
        selectedItem={selectedPackage}
        onSelect={setSelectedPackage}
        getKey={(pkg) => pkg.id}
        renderItemContent={(pkg, isCompact) => (
          <PackageCardContent pkg={pkg} isCompact={isCompact} />
        )}
      />

      {/* Output Summary */}
      <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-4 mt-2">
        <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5 mb-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          Selected Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 text-xs uppercase font-semibold">Vehicle:</span>
            <div className="font-bold text-slate-800">
              {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.licensePlate})
            </div>
          </div>
          <div>
            <span className="text-slate-500 text-xs uppercase font-semibold">Service:</span>
            <div className="font-bold text-slate-800">
              {selectedPackage.name} — {selectedPackage.price.toLocaleString()} VND
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
