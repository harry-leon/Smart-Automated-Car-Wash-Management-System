-- Thêm Bảng Đánh giá / Bình luận
CREATE TABLE "reviews" (
  "id" uuid DEFAULT (gen_random_uuid()) PRIMARY KEY,
  "customer_id" uuid NOT NULL,
  "booking_id" uuid UNIQUE NOT NULL, -- Mỗi booking chỉ được review 1 lần
  "rating" int NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "comment" text,
  "before_image_url" varchar(500),
  "after_image_url" varchar(500),
  "is_featured" boolean NOT NULL DEFAULT false, -- Để ghim lên trang chủ (Landing Page)
  "created_at" timestamp with time zone NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp with time zone NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Ràng buộc Khóa Ngoại cho reviews
ALTER TABLE "reviews" ADD FOREIGN KEY ("customer_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "reviews" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE;

-- Thêm Bảng cho Hệ thống Blog/Bài viết
CREATE TABLE "blog_categories" (
  "id" uuid DEFAULT (gen_random_uuid()) PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "slug" varchar(100) UNIQUE NOT NULL,
  "description" varchar(500),
  "created_at" timestamp with time zone NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "blog_articles" (
  "id" uuid DEFAULT (gen_random_uuid()) PRIMARY KEY,
  "category_id" uuid NOT NULL,
  "author_id" uuid NOT NULL, -- Trỏ về users (role STAFF/ADMIN)
  "title" varchar(255) NOT NULL,
  "slug" varchar(255) UNIQUE NOT NULL,
  "thumbnail_url" varchar(500),
  "excerpt" varchar(500),
  "content" text NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK ("status" IN ('DRAFT', 'PUBLISHED', 'HIDDEN')),
  "view_count" int NOT NULL DEFAULT 0,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp with time zone NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Ràng buộc Khóa Ngoại cho blog_articles
ALTER TABLE "blog_articles" ADD FOREIGN KEY ("category_id") REFERENCES "blog_categories" ("id");
ALTER TABLE "blog_articles" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("id");
