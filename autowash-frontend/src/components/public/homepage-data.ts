export type HomeService = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: string;
};

export type HomeCombo = {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  comboPrice: number;
  services: string[];
  badge?: string;
  highlight?: boolean;
};

export type HomeTestimonial = {
  id: string;
  name: string;
  vehicle: string;
  content: string;
  rating: number;
};

export const homeServices: HomeService[] = [
  {
    id: "s1",
    name: "Express Wash",
    description: "Quick exterior wash in 15 minutes",
    price: 50000,
    duration: "15 min",
    icon: "💧",
  },
  {
    id: "s2",
    name: "Premium Wash",
    description: "Full exterior and interior vacuum",
    price: 120000,
    duration: "30 min",
    icon: "✨",
  },
  {
    id: "s3",
    name: "Deep Clean",
    description: "Complete detailing inside and out",
    price: 350000,
    duration: "90 min",
    icon: "🏆",
  },
  {
    id: "s4",
    name: "Engine Bay Clean",
    description: "Safe engine compartment cleaning",
    price: 200000,
    duration: "45 min",
    icon: "⚙️",
  },
];

export const homeCombos: HomeCombo[] = [
  {
    id: "c1",
    name: "Monthly Silver Pack",
    description: "8 express washes per month",
    originalPrice: 400000,
    comboPrice: 299000,
    services: ["Express Wash x8"],
    badge: "Most Popular",
  },
  {
    id: "c2",
    name: "Monthly Gold Pack",
    description: "4 premium washes and 2 deep cleans",
    originalPrice: 1180000,
    comboPrice: 799000,
    services: ["Premium Wash x4", "Deep Clean x2"],
    badge: "Best Value",
    highlight: true,
  },
  {
    id: "c3",
    name: "Corporate Fleet Pack",
    description: "20 washes for company vehicles",
    originalPrice: 1000000,
    comboPrice: 699000,
    services: ["Express Wash x20"],
    badge: "For Business",
  },
];

export const homeTestimonials: HomeTestimonial[] = [
  {
    id: "t1",
    name: "Anh Hung",
    vehicle: "Toyota Camry",
    content: "Washed very thoroughly, cool waiting room, will keep coming back!",
    rating: 5,
  },
  {
    id: "t2",
    name: "Chi Lan",
    vehicle: "Honda CR-V",
    content: "Book in 30 seconds, no more waiting in line. Love it!",
    rating: 5,
  },
  {
    id: "t3",
    name: "Anh Tuan",
    vehicle: "Mazda CX-5",
    content: "German technology car wash, noticeably better paint protection.",
    rating: 5,
  },
];

export const homeGallery = [
  {
    src: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1200&q=80&auto=format&fit=crop",
    alt: "Professional exterior wash service",
    label: "Professional exterior wash",
  },
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop",
    alt: "Interior deep clean service",
    label: "Interior deep clean",
  },
  {
    src: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1200&q=80&auto=format&fit=crop",
    alt: "Premium foam wash service",
    label: "Premium foam wash",
  },
  {
    src: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&q=80&auto=format&fit=crop",
    alt: "Car wash finishing result",
    label: "Sparkling result",
  },
];
