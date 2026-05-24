import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { brandModelCatalog } from "../mock/vehicles.mock";
import type { Vehicle, VehicleBrand, VehicleFormValues } from "../types/vehicle.types";
import { BrandSelect } from "./BrandSelect";
import { ModelSelect } from "./ModelSelect";
import styles from "../styles/vehicles.module.css";

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (values: VehicleFormValues) => void;
  onCancel: () => void;
}

export function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const initialBrand = vehicle?.brand ?? "Toyota";
  const firstModel = brandModelCatalog[initialBrand][0];
  const [licensePlate, setLicensePlate] = useState(vehicle?.licensePlate ?? "");
  const [brand, setBrand] = useState<VehicleBrand>(initialBrand);
  const [model, setModel] = useState(vehicle?.model ?? firstModel.model);
  const [color, setColor] = useState(vehicle?.color ?? "");
  const [imageUrl, setImageUrl] = useState(vehicle?.imageUrl ?? "");
  const [isDefault, setIsDefault] = useState(vehicle?.isDefault ?? false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedVehicleType = useMemo(() => {
    return (
      brandModelCatalog[brand].find((option) => option.model === model)?.vehicleType ??
      brandModelCatalog[brand][0].vehicleType
    );
  }, [brand, model]);

  const handleBrandChange = (nextBrand: VehicleBrand) => {
    const nextModel = brandModelCatalog[nextBrand][0];
    setBrand(nextBrand);
    setModel(nextModel.model);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!licensePlate.trim()) {
      setError("License plate is required.");
      return;
    }

    onSubmit({
      licensePlate,
      brand,
      model,
      vehicleType: selectedVehicleType,
      color,
      imageUrl: imageUrl.trim() || undefined,
      isDefault,
    });
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
        setError("");
      }
    };
    reader.onerror = () => setError("Could not read the selected image.");
    reader.readAsDataURL(file);
  };

  const clearVehicleImage = () => {
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form className={styles.vehicleForm} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>License plate</span>
        <input
          value={licensePlate}
          onChange={(event) => {
            setLicensePlate(event.target.value);
            setError("");
          }}
          required
        />
      </label>
      <div className={styles.formGrid}>
        <BrandSelect value={brand} onChange={handleBrandChange} />
        <ModelSelect brand={brand} value={model} onChange={setModel} />
      </div>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Vehicle type</span>
          <input value={selectedVehicleType} readOnly aria-readonly="true" />
        </label>
        <label className={styles.field}>
          <span>Color</span>
          <input value={color} onChange={(event) => setColor(event.target.value)} />
        </label>
      </div>
      <section className={styles.imageUploadField}>
        <div>
          <span>Vehicle photo</span>
          <p>
            Upload a photo from your computer. It will be used on the vehicle card and default
            vehicle panel.
          </p>
        </div>
        <div className={styles.imageUploadControl}>
          <div className={styles.imagePreview}>
            {imageUrl ? (
              <img src={imageUrl} alt="Vehicle preview" />
            ) : (
              <span>No image selected</span>
            )}
          </div>
          <div className={styles.imageActions}>
            <label>
              Upload photo
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
            {imageUrl ? (
              <button type="button" onClick={clearVehicleImage}>
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </section>
      <label className={styles.checkboxField}>
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(event) => setIsDefault(event.target.checked)}
        />
        Set as default vehicle
      </label>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <div className={styles.formActions}>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.primaryButton}>
          Save vehicle
        </button>
      </div>
    </form>
  );
}
