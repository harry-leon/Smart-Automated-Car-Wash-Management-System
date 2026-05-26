// Translation keys and default values
export const translations = {
  // Header
  home: { en: "Home", vi: "Trang Chủ" },
  services: { en: "Services", vi: "Dịch Vụ" },
  packages: { en: "Packages", vi: "Gói Tháng" },
  reviews: { en: "Reviews", vi: "Đánh Giá" },
  signIn: { en: "Sign In", vi: "Đăng Nhập" },
  register: { en: "Register", vi: "Đăng Ký" },

  // Hero
  nextGenPlatform: { en: "Next-Gen Car Care Platform", vi: "Nền Tảng Chăm Sóc Xe Thế Hệ Mới" },
  bookInThirtySec: {
    en: "Book in 30 seconds. No waiting in line. Premium finish guaranteed or 100% money back.",
    vi: "Đặt lịch 30 giây. Không lo xếp hàng. Hoàn tiền 100% nếu bạn không hài lòng.",
  },
  bookNow: { en: "Book Now", vi: "Đặt Lịch Ngay" },
  viewServices: { en: "View Services", vi: "Xem Dịch Vụ" },

  // Trust badges
  bookIn30s: { en: "Book in 30s", vi: "Đặt lịch 30 giây" },
  moneyBack100: { en: "100% Money Back", vi: "Hoàn tiền 100%" },
  fiveStarLounge: { en: "5-Star Lounge", vi: "Phòng chờ 5 sao" },

  // Why section
  whyAura: { en: "Why AURA CAR CARE?", vi: "Tại Sao Chọn AURA CAR CARE?" },
  touchlessWash: { en: "Touchless Wash", vi: "Rửa Không Chạm" },
  germanTech: { en: "German-tech foam protects your paint", vi: "Bọt công nghệ Đức bảo vệ sơn xe" },
  waitingLounge: { en: "5-Star Waiting Lounge", vi: "Phòng Chờ 5 Sao" },
  loungeDetails: { en: "AC, free drinks & high-speed Wi-Fi", vi: "Máy lạnh, nước miễn phí & Wi-Fi tốc độ cao" },
  realTimeBooking: { en: "Real-time Booking", vi: "Đặt Lịch Thời Gian Thực" },
  noQueue: { en: "Guaranteed slot, zero queue", vi: "Không xếp hàng, có chỗ được đảm bảo" },
  loyaltyRewards: { en: "Loyalty Rewards", vi: "Tích Điểm Thưởng" },
  earnPoints: { en: "Earn points every wash", vi: "Tích điểm mỗi lần rửa" },

  // Services
  ourServices: { en: "Our Services", vi: "Dịch Vụ Của Chúng Tôi" },
  professionalCare: { en: "Professional Car Care", vi: "Chăm Sóc Xe Chuyên Nghiệp" },
  servicesDesc: {
    en: "From quick express washes to full detailing — we cover everything your car needs.",
    vi: "Từ rửa nhanh đến chi tiết toàn diện — chúng tôi có tất cả những gì xe bạn cần.",
  },

  // Gallery
  ourFacility: { en: "Our Facility", vi: "Cơ Sở Của Chúng Tôi" },
  seeForYourself: { en: "See It For Yourself", vi: "Tận Mắt Chứng Kiến" },

  // Before/After
  seeDifference: { en: "See The Difference", vi: "Thấy Sự Khác Biệt" },
  realResults: { en: "Real results from real customers", vi: "Kết quả thực tế từ khách hàng thực tế" },
  before: { en: "BEFORE", vi: "TRƯỚC" },
  after: { en: "AFTER", vi: "SAU" },
  moneyBackGuarantee: { en: "100% Money Back Guarantee", vi: "Cam Kết Hoàn Tiền 100%" },
  guaranteeDesc: {
    en: "Not satisfied with the quality? We'll refund every penny.",
    vi: "Không hài lòng với chất lượng? Chúng tôi hoàn lại toàn bộ tiền.",
  },

  // Combos
  monthlyPackages: { en: "Monthly Packages", vi: "Gói Tháng" },
  saveMores: { en: "Save More With Combos", vi: "Tiết Kiệm Hơn Với Gói Tháng" },
  saveComboDesc: {
    en: "Subscribe monthly and save up to 35% compared to single bookings.",
    vi: "Đăng ký theo tháng và tiết kiệm đến 35% so với đặt lịch từng lần.",
  },

  // Reviews
  customerReviews: { en: "Customer Reviews", vi: "Đánh Giá Khách Hàng" },
  whatCustomersSay: { en: "What Our Customers Say", vi: "Khách Hàng Nói Gì Về Chúng Tôi" },

  // CTA Banner
  readyToBook: { en: "Ready to Book Your First Wash?", vi: "Sẵn Sàng Đặt Lịch Rửa Xe?" },
  joinThousands: {
    en: "Join thousands of happy car owners in HCMC.",
    vi: "Hàng nghìn chủ xe tại TP.HCM đã tin tưởng chúng tôi.",
  },
  createAccount: { en: "Create Free Account", vi: "Tạo Tài Khoản Miễn Phí" },

  // Footer
  quickLinks: { en: "Quick Links", vi: "Liên Kết Nhanh" },
  contact: { en: "Contact", vi: "Liên Hệ" },
  address: { en: "123 Nguyen Van Linh, District 7, HCMC", vi: "123 Nguyễn Văn Linh, Q.7, TP.HCM" },
  hours: { en: "Mon–Sun: 7:00 AM – 8:00 PM", vi: "T2–CN: 7:00 – 20:00" },
  allRights: { en: "All rights reserved.", vi: "Bảo lưu mọi quyền." },
};

export type TranslationKey = keyof typeof translations;
