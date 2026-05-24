export interface Service {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
  price: number;
  duration: string;
  icon: string;
}

export interface ComboPackage {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
  originalPrice: number;
  comboPrice: number;
  services: string[];
  badge?: string;
  badgeVi?: string;
  highlight?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  vehicle: string;
  content: string;
  contentVi: string;
  rating: number;
}

export interface HomepageData {
  services: Service[];
  combos: ComboPackage[];
  testimonials: Testimonial[];
}
