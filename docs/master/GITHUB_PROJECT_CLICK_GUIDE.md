# GitHub Project Click Guide

## Mục tiêu

Tạo đúng setup tôi đã khuyến nghị:

- 1 GitHub Project chính
- nhiều view bên trong cùng project
- dùng cho `AutoWash Pro`

## Tên project nên dùng

`AutoWash Pro Delivery`

## Chọn template nào lúc tạo project

Chọn:

- `Iterative development`

Nếu anh thấy template đó không tiện, chọn:

- `Table`

Sau đó tự thêm các view còn lại. Kết quả cuối cùng gần như giống nhau.

## Các bước tạo trong GitHub

### Bước 1: Tạo project

1. Vào `Projects`
2. Chọn `New project`
3. Chọn `Iterative development`
4. Đặt tên:
   `AutoWash Pro Delivery`

## Bước 2: Tạo các field cần thiết

Trong project, thêm các field sau:

### Single select

- `Priority`
  - `P0`
  - `P1`
  - `P2`
  - `P3`

- `Epic`
  - `Epic 0 - Foundation`
  - `Epic 1 - Auth`
  - `Epic 2 - User`
  - `Epic 3 - Vehicle`
  - `Epic 4 - Booking`
  - `Epic 5 - Operations`
  - `Epic 7 - Loyalty`
  - `Epic 8 - Promotion`
  - `Epic 9 - Admin`
  - `Epic 10 - Notification`
  - `Epic 11 - QA`

- `Workspace`
  - `Customer`
  - `Operations`
  - `Admin`
  - `Backend`
  - `Shared`

- `Size`
  - `S`
  - `M`
  - `L`

- `Sprint`
  - `Sprint 1`
  - `Sprint 2`
  - `Sprint 3`
  - `Sprint 4`
  - `Sprint 5`
  - `Sprint 6`
  - `Sprint 7`

### Date fields

- `Start Date`
- `Target Date`

## Bước 3: Chuẩn hóa cột trạng thái

Giữ hoặc sửa `Status` thành:

- `Backlog`
- `Ready`
- `In Progress`
- `Review`
- `Blocked`
- `Done`

## Bước 4: Tạo các view

Tạo 4 view sau trong cùng project:

### 1. `Backlog`

- Type: `Table`
- Sort:
  - `Priority` tăng dần
  - `Target Date` tăng dần
- Group by:
  - không cần group, hoặc group theo `Epic`

### 2. `Sprint Board`

- Type: `Board`
- Group by: `Status`

### 3. `Roadmap`

- Type: `Roadmap`
- Date fields:
  - Start = `Start Date`
  - End = `Target Date`
- Group by:
  - `Epic`

### 4. `Bugs`

- Type: `Board` hoặc `Table`
- Filter:
  - `label:bug`
  hoặc
  - title/body theo team quy ước bug

## Bước 5: Nạp dữ liệu mẫu

File seed tôi đã tạo:

[github-project-seed.csv](/D:/CarWash/docs/master/github-project-seed.csv)

Anh có thể dùng file này để:

- copy từng dòng tạo issue/task
- hoặc import/copy vào project thủ công

## Cách dùng thực tế

### Giai đoạn đầu

Dùng 3 view chính:

- `Backlog`
- `Sprint Board`
- `Roadmap`

### Khi bắt đầu test

Thêm và dùng mạnh view:

- `Bugs`

## Cách tôi khuyên anh vận hành

### Mỗi task phải có ít nhất

- `Status`
- `Priority`
- `Epic`
- `Workspace`
- `Sprint`

### Quy tắc đơn giản

- `P0`: chặn luồng chính hoặc hạ tầng nền
- `P1`: tính năng chính
- `P2`: nâng cấp, phụ trợ
- `P3`: tối ưu sau

## Mapping nhanh theo dự án AutoWash

- `Customer`: customer portal
- `Operations`: staff workspace
- `Admin`: admin dashboard
- `Backend`: spring boot APIs
- `Shared`: auth, contract, realtime, middleware, cấu trúc dùng chung

## Kết quả mong muốn

Sau khi setup xong, project của anh sẽ có:

- 1 nơi chứa toàn bộ task
- 1 board để kéo trạng thái
- 1 roadmap để nhìn timeline theo epic
- 1 vùng riêng để triage bug
