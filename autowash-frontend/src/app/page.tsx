import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Clock, Award, Users, Shield, Zap } from "lucide-react";

export default function PublicHomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-2xl tracking-tight">AURA CAR CARE</div>
              <div className="text-xs text-muted-foreground -mt-1">SMART AUTO WASH</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href="/login?tab=register">
              <Button>Đăng ký miễn phí</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm mb-6">
            <Zap className="w-4 h-4" />
            Hệ thống rửa xe thông minh thế hệ mới
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">
            Rửa xe đẳng cấp.<br />
            <span className="text-primary">Trải nghiệm dễ dàng.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Đặt lịch nhanh chóng • Tích điểm thành viên • Theo dõi tiến độ rửa xe thời gian thực
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-10 h-14 rounded-2xl">
              <Link href="/login">Bắt đầu ngay</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-10 h-14 rounded-2xl">
              <Link href="#dich-vu">Xem dịch vụ</Link>
            </Button>
          </div>

          <div className="mt-16 flex justify-center gap-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> Bảo mật cao
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" /> Tiết kiệm thời gian
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" /> Ưu đãi thành viên
            </div>
          </div>
        </div>
      </section>

      {/* DỊCH VỤ NỔI BẬT */}
      <section id="dich-vu" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight mb-3">Gói dịch vụ</h2>
            <p className="text-muted-foreground text-lg">Chọn gói phù hợp với nhu cầu của bạn</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Basic Wash", price: "150.000", desc: "Rửa ngoài + hút bụi" },
              { name: "Premium Wash", price: "250.000", desc: "Rửa toàn diện + đánh bóng" },
              { name: "Deluxe Care", price: "450.000", desc: "Chăm sóc cao cấp toàn xe" },
            ].map((pkg, i) => (
              <Card key={i} className="hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="text-primary mb-4">
                    <Car className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{pkg.name}</h3>
                  <p className="text-3xl font-bold mb-1">{pkg.price}đ</p>
                  <p className="text-sm text-muted-foreground mb-6">{pkg.desc}</p>
                  <Button className="w-full" variant="outline">
                    Chọn gói này
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* LOYALTY & COMBO */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Thành viên AURA</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
            Tích điểm - Đổi quà - Ưu đãi đặc biệt
          </p>

          <div className="inline-flex items-center gap-3 bg-white rounded-3xl px-8 py-4 shadow-sm">
            <Award className="w-8 h-8 text-primary" />
            <div className="text-left">
              <div className="font-semibold">500+ khách hàng đã tích điểm</div>
              <div className="text-sm text-muted-foreground">Tháng này</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Car className="w-8 h-8" />
              <span className="font-bold text-2xl">AURA CAR CARE</span>
            </div>
            <p className="text-slate-400">Hệ thống quản lý rửa xe tự động thông minh</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Rửa xe cơ bản</li>
              <li>Chăm sóc nội thất</li>
              <li>Đánh bóng sơn</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Công ty</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Về chúng tôi</li>
              <li>Tuyển dụng</li>
              <li>Liên hệ</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <p className="text-slate-400">Hotline: 1900 xxxx</p>
            <p className="text-slate-400">Email: info@auracarcare.vn</p>
          </div>
        </div>

        <div className="text-center text-slate-500 text-sm mt-16 border-t border-slate-800 pt-8">
          © 2026 AURA CAR CARE • All rights reserved
        </div>
      </footer>
    </div>
  );
}
