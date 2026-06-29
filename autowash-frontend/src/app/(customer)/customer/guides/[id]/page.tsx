"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLanguageStore, translate } from "@/shared/store/language.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  BadgeCheck,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Eye,
  Heart,
  Link as LinkIcon,
  MessageCircle,
  Share2,
  ThumbsUp,
  User,
  Star,
} from "lucide-react";
import { Button } from "@/shared/ui/ui/button";
import { cn } from "@/shared/lib/utils";

const GUIDE_DETAILS = {
  post1: {
    tag: { vi: "Mẹo bảo vệ", en: "Protection Tips" },
    duration: { vi: "3 phút đọc", en: "3 min read" },
    title: {
      vi: "Bí quyết giữ màu sơn xe luôn như mới trong mùa mưa",
      en: "Secrets to keeping your car paint brand new in the rainy season",
    },
    excerpt: {
      vi: "Mùa mưa kéo dài mang theo axit và bụi bẩn làm tàn phá lớp sơn bóng của bạn. Hãy bảo vệ bề mặt sơn ngay hôm nay bằng các bước đơn giản này...",
      en: "Continuous rain carries acids and dirt that ruin your gloss coat. Protect your paint surface today with these simple steps...",
    },
    image: "/images/rainy-care.jpg",
    content: {
      vi: [
        {
          heading: "1. Tại sao nước mưa gây hại cho sơn xe?",
          text: "Nước mưa hiện nay chứa nhiều nồng độ axit tự nhiên cùng bụi khí quyển bám vào bề mặt sơn. Khi nước mưa bốc hơi, lượng axit này lắng đọng và tạo ra các vết ố mốc ăn sâu vào lớp sơn bóng (clear coat), làm mất đi độ phản chiếu gương ban đầu.",
        },
        {
          heading: "2. Quy trình bảo dưỡng sơn xe mùa mưa",
          text: "Rửa xe ngay sau khi đi mưa để trung hòa axit và loại bỏ bùn đất. Tránh lau khô xe bằng khăn khi xe chưa sạch vì cát mịn sẽ gây xước xoáy bề mặt sơn.",
        },
        {
          heading: "3. Các sản phẩm hỗ trợ khuyên dùng",
          text: "Sử dụng dung dịch phủ nhanh Ceramic Quick Detailer hoặc lắp các tấm chắn bùn chuyên dụng để giảm thiểu tối đa chất bẩn bám dính.",
        },
      ],
      en: [
        {
          heading: "1. Why rainwater ruins your car paint?",
          text: "Rainwater carries natural acids and atmospheric pollutants. When water evaporates, these acids settle down and create water spots that etch into the clear coat, ruining the mirror finish.",
        },
        {
          heading: "2. Rain season maintenance routine",
          text: "Wash your car immediately after driving in the rain to neutralize acids. Never wipe a dirty wet car with a dry towel as fine grit will scratch the paint.",
        },
        {
          heading: "3. Recommended protective products",
          text: "Use Ceramic Quick Detailer sprays or add paint protection film (PPF) on high-impact areas.",
        },
      ],
    },
  },
  post2: {
    tag: { vi: "Kiến thức Ceramic", en: "Ceramic Detailing" },
    duration: { vi: "5 phút đọc", en: "5 min read" },
    title: {
      vi: "Tại sao rửa xe thông thường tại nhà có thể làm xước sơn?",
      en: "Why standard home washing might scratch your paint?",
    },
    excerpt: {
      vi: "Sử dụng khăn lau không đạt chuẩn và xà phòng rửa chén sẽ làm mòn lớp bảo vệ ceramic và tạo ra vết xước xoáy mất thẩm mỹ...",
      en: "Using sub-standard cloths and dish soap degrades ceramic coatings and creates micro swirl scratches...",
    },
    image: "/images/scratch-care.jpg",
    content: {
      vi: [
        {
          heading: "1. Tác hại của xà phòng rửa chén và khăn kém chất lượng",
          text: "Xà phòng rửa chén có tính tẩy rửa mạnh (de-greasing) làm trôi sạch lớp wax hoặc lớp phủ bảo vệ sơn. Khăn lau thông thường không có các khe sợi microfiber để giữ cát, khiến cát cọ xát trực tiếp lên lớp sơn tạo ra vết xước mạng nhện.",
        },
        {
          heading: "2. Nguyên tắc rửa xe 2 xô (Two-Bucket Method)",
          text: "Sử dụng một xô chứa xà phòng chuyên dụng và một xô chứa nước sạch để xả bẩn khăn/găng rửa xe. Luôn dùng tấm lọc cát (grit guard) ở đáy xô để cát không bám ngược lại khăn lau.",
        },
      ],
      en: [
        {
          heading: "1. The damage of dish soap and low-quality towels",
          text: "Dish soap has strong degreasing properties that strip away wax or sealant. Standard towels drag dirt across the paint rather than trapping it, causing swirl marks.",
        },
        {
          heading: "2. The Two-Bucket Method",
          text: "Use one bucket for wash shampoo and one bucket with clean water to rinse the wash mitt. Always place grit guards in both buckets.",
        },
      ],
    },
  },
};

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguageStore();
  const user = useAuthStore((state) => state.user);

  const t = (vi: string, en: string) => translate(language, vi, en);

  const guide = GUIDE_DETAILS[id as keyof typeof GUIDE_DETAILS] ?? GUIDE_DETAILS.post1;

  const contentList = language === "en" ? guide.content.en : guide.content.vi;

  const [likes, setLikes] = useState(248);
  const [hasLiked, setHasLiked] = useState(false);
  const [hearts, setHearts] = useState(96);
  const [hasHearted, setHasHearted] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, author: "Anh Minh", content: t("Bài viết chi tiết quá, cuối tuần tôi mang xe qua Aura làm thử phủ Ceramic luôn.", "Very detailed article, I will bring my car to Aura this weekend for Ceramic coating."), time: t("10 phút trước", "10 mins ago") },
    { id: 2, author: "Chị Ngọc", content: t("Tôi đã thử rửa xe 2 xô tại nhà và thấy giảm xước xoáy hẳn, cảm ơn chuyên gia!", "I tried the 2-bucket wash at home and swirl marks are visibly reduced, thanks technical lead!"), time: t("1 giờ trước", "1 hour ago") }
  ]);

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  const handleHeart = () => {
    if (hasHearted) {
      setHearts(hearts - 1);
      setHasHearted(false);
    } else {
      setHearts(hearts + 1);
      setHasHearted(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        author: user?.fullName || t("Khách hàng", "Customer"),
        content: newComment.trim(),
        time: t("Vừa xong", "Just now"),
      }
    ]);
    setNewComment("");
  };

  return (
    <div className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-slate-50">
      <div className="relative mx-auto flex max-w-5xl flex-col gap-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
          <Link href="/customer/home" className="hover:text-primary">
            {t("Trang chủ", "Home")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>{t("Hướng dẫn", "Guides")}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary font-black">{t(guide.tag.vi, guide.tag.en)}</span>
        </nav>

        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
              <BadgeCheck className="h-3.5 w-3.5 text-amber-500" /> {t(guide.tag.vi, guide.tag.en)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6efd9] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
              <CircleDot className="h-3.5 w-3.5 text-amber-500" /> {t(guide.duration.vi, guide.duration.en)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
              <Eye className="h-3.5 w-3.5" /> 2.4k {t("lượt xem", "views")}
            </span>
          </div>

          <h1 className="max-w-4xl text-3xl sm:text-4xl font-black leading-tight tracking-tight text-primary">
            {t(guide.title.vi, guide.title.en)}
          </h1>
          
          <p className="max-w-3xl text-sm leading-relaxed text-slate-500 font-semibold">
            {t(guide.excerpt.vi, guide.excerpt.en)}
          </p>

          {/* Author info */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-200/60 py-3.5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
                <User className="h-5 w-5 text-amber-200" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-black text-primary">
                  Aura Editorial Team
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  <Clock className="h-3 w-3" /> {t("Cập nhật 29/06/2026", "Updated Jun 29, 2026")}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-primary hover:text-primary">
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90">
                <Bookmark className="h-3.5 w-3.5 text-amber-200" /> {t("Lưu bài viết", "Save")}
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 shadow-sm">
          <img
            src={guide.image}
            alt={t(guide.title.vi, guide.title.en)}
            className="h-[360px] w-full object-cover"
          />
          <div className="absolute bottom-4 right-4 rounded-xl bg-black/60 px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-md">
            Photos: Aura Studio
          </div>
        </div>

        {/* Content body layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_300px] mt-2">
          
          <article className="space-y-6">
            
            {/* Table of contents */}
            <div className="rounded-3xl border border-amber-500/20 bg-[#f6efd9]/10 p-5">
              <div className="text-[10px] font-black uppercase tracking-wider text-primary">
                {t("Nội dung bài viết", "In this article")}
              </div>
              <ol className="mt-3.5 space-y-2.5 text-xs font-bold text-primary">
                {contentList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 hover:text-primary">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-lg bg-primary text-[10px] font-black text-white">
                      {i + 1}
                    </span>
                    <a href={`#section-${i + 1}`} className="hover:underline">
                      {item.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            {/* Sections */}
            {contentList.map((item, i) => (
              <section key={i} id={`section-${i + 1}`} className="space-y-3 pt-4 border-t border-slate-200/40 first:border-none first:pt-0">
                <h3 className="text-xl font-black text-primary">
                  {item.heading}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {item.text}
                </p>

                {i === 0 && (
                  <blockquote className="rounded-2xl border-l-4 border-amber-500 bg-amber-50/30 px-5 py-4 text-xs italic font-semibold text-primary leading-relaxed">
                    {t(
                      "\"Một chiếc xe được bảo dưỡng và phủ bảo vệ đúng cách có thể duy trì độ bóng như mới lâu hơn 3-5 năm. Bảo dưỡng thường xuyên giúp ngăn ngừa xước dăm.\"",
                      "\"A vehicle maintained and protected properly can retain its showroom shine 3-5 years longer. Regular details prevent micro swirl marks.\""
                    )}
                    <div className="mt-2 text-[10px] not-italic text-slate-400 font-bold uppercase tracking-wider">
                      — Technical Director, Aura Car Care
                    </div>
                  </blockquote>
                )}
              </section>
            ))}

            {/* Call To Action Block */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-primary p-6 text-white shadow-lg">
              <div>
                <h4 className="text-base font-black text-white tracking-tight">
                  {t("Đặt lịch kiểm tra sơn xe miễn phí", "Book Free Paint Diagnostics")}
                </h4>
                <p className="mt-1 text-[11px] text-slate-300 font-semibold">
                  {t("Chuyên gia Aura sẽ chẩn đoán tình trạng bề mặt sơn của bạn trong 15 phút.", "Aura experts will diagnose your vehicle's gloss and clear coat health in 15 mins.")}
                </p>
              </div>
              <Button asChild className="rounded-xl bg-amber-500 hover:bg-amber-500/90 text-primary font-black text-xs px-5">
                <Link href="/customer/services">
                  {t("Đặt lịch ngay", "Book Now")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {/* Engagement buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/60 pt-5">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleLike}
                  className={cn(
                    "rounded-full h-8 text-[11px] font-bold border-slate-200 transition",
                    hasLiked ? "text-primary bg-primary/5 border-primary/20" : "text-slate-600 hover:text-primary"
                  )}
                >
                  <ThumbsUp className={cn("h-3 w-3 mr-1.5", hasLiked && "fill-[#155345]")} /> {t("Hữu ích", "Helpful")} • {likes}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleHeart}
                  className={cn(
                    "rounded-full h-8 text-[11px] font-bold border-slate-200 transition",
                    hasHearted ? "text-rose-600 bg-rose-50 border-rose-200" : "text-slate-600 hover:text-rose-600"
                  )}
                >
                  <Heart className={cn("h-3 w-3 mr-1.5", hasHearted ? "fill-rose-650 text-rose-650" : "text-rose-500")} /> {hearts}
                </Button>
              </div>
              
              <Link
                href="/customer/home"
                className="inline-flex items-center gap-1 text-xs font-black text-primary hover:underline"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> {t("Quay lại trang chủ", "Back to Home")}
              </Link>
            </div>

            {/* Interactive Comment Section */}
            <div className="mt-8 space-y-6 border-t border-slate-200/60 pt-6">
              <h4 className="text-base font-black text-primary flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                {t("Bình luận", "Comments")} ({comments.length})
              </h4>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t("Viết bình luận của bạn...", "Write a comment...")}
                  className="w-full min-h-[80px] rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-[#155345]/20 resize-none"
                />
                <div className="flex justify-end">
                  <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4">
                    {t("Gửi bình luận", "Post Comment")}
                  </Button>
                </div>
              </form>

              {/* Comment List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 bg-white/50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-650 shrink-0 font-black text-xs">
                      {comment.author[0]}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800">{comment.author}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{comment.time}</span>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            
            {/* Newsletter Card */}
            <div className="rounded-3xl bg-amber-50/50 p-5 border border-amber-500/20">
              <h4 className="text-sm font-black text-primary">
                {t("Đăng ký nhận mẹo hay", "Weekly Car Care Tips")}
              </h4>
              <p className="mt-1 text-[10px] text-slate-500 font-semibold leading-relaxed">
                {t("Nhận các hướng dẫn bảo quản xe mới nhất từ kỹ sư của chúng tôi.", "Subscribe to get detailed maintenance secrets directly from our technicians.")}
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="mt-3.5 w-full rounded-xl border border-amber-500/30 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-[#155345]/20"
              />
              <Button className="mt-2 w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5">
                {t("Đăng ký", "Subscribe")}
              </Button>
            </div>

            {/* Popular Topics */}
            <div className="rounded-3xl border border-slate-200/50 bg-white p-5 shadow-sm">
              <h4 className="text-xs font-black text-primary uppercase tracking-wider pb-2 border-b border-slate-100">
                {t("Chủ đề nổi bật", "Popular Topics")}
              </h4>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {["Ceramic", "Detailing", "Paint Protection", "Interior Clean", "Touchless Wash"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="cursor-pointer rounded-xl bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-primary hover:text-white transition"
                    >
                      #{tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}
