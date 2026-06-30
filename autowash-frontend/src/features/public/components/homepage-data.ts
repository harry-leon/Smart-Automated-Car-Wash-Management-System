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
    name: "Rửa nhanh",
    description: "Rửa ngoại thất nhanh trong 15 phút",
    price: 50000,
    duration: "15 phút",
    icon: "💧",
  },
  {
    id: "s2",
    name: "Rửa cao cấp",
    description: "Rửa ngoại thất và hút bụi nội thất",
    price: 120000,
    duration: "30 phút",
    icon: "✨",
  },
  {
    id: "s3",
    name: "Chăm sóc chuyên sâu",
    description: "Làm sạch chi tiết cả trong và ngoài xe",
    price: 350000,
    duration: "90 phút",
    icon: "🏆",
  },
  {
    id: "s4",
    name: "Vệ sinh khoang máy",
    description: "Làm sạch khoang máy an toàn",
    price: 200000,
    duration: "45 phút",
    icon: "⚙️",
  },
];

export const homeCombos: HomeCombo[] = [
  {
    id: "c1",
    name: "Gói bạc hằng tháng",
    description: "8 lượt rửa nhanh mỗi tháng",
    originalPrice: 400000,
    comboPrice: 299000,
    services: ["Rửa nhanh x8"],
    badge: "Phổ biến nhất",
  },
  {
    id: "c2",
    name: "Gói vàng hằng tháng",
    description: "4 lượt rửa cao cấp và 2 lượt chăm sóc chuyên sâu",
    originalPrice: 1180000,
    comboPrice: 799000,
    services: ["Rửa cao cấp x4", "Chăm sóc chuyên sâu x2"],
    badge: "Giá trị tốt nhất",
    highlight: true,
  },
  {
    id: "c3",
    name: "Gói đội xe doanh nghiệp",
    description: "20 lượt rửa cho xe công ty",
    originalPrice: 1000000,
    comboPrice: 699000,
    services: ["Rửa nhanh x20"],
    badge: "Cho doanh nghiệp",
  },
];

export const homeTestimonials: HomeTestimonial[] = [
  {
    id: "t1",
    name: "Anh Hưng",
    vehicle: "Toyota Camry",
    content: "Rửa rất kỹ, khu chờ thoải mái, tôi sẽ quay lại.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Chị Lan",
    vehicle: "Honda CR-V",
    content: "Đặt lịch trong 30 giây, không còn phải chờ xếp hàng.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Anh Tuấn",
    vehicle: "Mazda CX-5",
    content: "Công nghệ rửa xe hiện đại, lớp sơn được bảo vệ rõ rệt.",
    rating: 5,
  },
];

export const homeGallery = [
  {
    src: "/images/gallery0.jpg",
    alt: "Dịch vụ rửa ngoại thất chuyên nghiệp",
    label: "Rửa ngoại thất chuyên nghiệp",
  },
  {
    src: "/images/gallery1.jpg",
    alt: "Dịch vụ làm sạch nội thất chuyên sâu",
    label: "Làm sạch nội thất",
  },
  {
    src: "/images/gallery2.jpg",
    alt: "Dịch vụ rửa bọt cao cấp",
    label: "Rửa bọt cao cấp",
  },
  {
    src: "/images/gallery3.jpg",
    alt: "Kết quả hoàn thiện sau khi rửa xe",
    label: "Hoàn thiện sáng bóng",
  },
];
