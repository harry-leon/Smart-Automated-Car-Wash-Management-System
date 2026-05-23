# GitHub Project Setup Guide

## Mục tiêu

Chọn mẫu GitHub Project phù hợp cho dự án `AutoWash Pro` và dùng kết hợp nhiều view để quản lý:

- backlog tổng
- tiến độ theo trạng thái
- roadmap theo mốc
- bug sau này

## Khuyến nghị ngắn gọn

Nếu chỉ chọn một cách làm thực tế nhất, hãy tạo:

1. `Table` hoặc `Iterative development` để làm project gốc
2. thêm `Board` view để kéo thả trạng thái
3. thêm `Roadmap` view để nhìn timeline
4. khi bắt đầu test thật, thêm `Bug tracker` view

Không nên tạo nhiều project rời ngay từ đầu nếu team còn ít người. Tốt hơn là:

- 1 project chính
- nhiều view bên trong project đó

## Tôi khuyên dùng gì cho dự án này

### Option tốt nhất cho nhóm làm đồ án/phần mềm

Kết hợp:

- `Iterative development`
- `Roadmap`
- `Bug tracker`

Lý do:

- `Iterative development` hợp để quản lý sprint, backlog, in progress, done
- `Roadmap` hợp để chia tiến độ theo Epic lớn như Auth, Vehicle, Booking, Operations, Loyalty, Admin
- `Bug tracker` hợp cho giai đoạn test và sửa lỗi sau khi có code chạy

### Option đơn giản hơn, dễ dùng nhất

Kết hợp:

- `Table`
- `Board`
- `Roadmap`

Lý do:

- `Table` dễ nhập task hàng loạt
- `Board` dễ theo dõi trạng thái từng việc
- `Roadmap` giúp không bị trôi deadline

## Không nên ưu tiên ngay lúc này

- `Product launch`: phù hợp sản phẩm chuẩn bị release thật ra người dùng
- `Team retrospective`: phù hợp họp cải tiến quy trình, không phải view chính để quản lý task
- `Feature release`: hữu ích nếu team release theo từng cụm tính năng lớn, nhưng hiện tại chưa cần hơn `Roadmap`
- `Team planning`: dùng được, nhưng với đồ án nhỏ thì `Iterative development` thường dễ hiểu hơn
- `Kanban`: tốt, nhưng có thể thay bằng việc thêm `Board view` trong cùng project

## Cách dựng project đề xuất

### Cách 1: Một project chính duy nhất

Tạo 1 project tên:

`AutoWash Pro Delivery`

Bên trong tạo các view:

1. `Backlog` dùng `Table`
2. `Sprint Board` dùng `Board`
3. `Roadmap` dùng `Roadmap`
4. `Bugs` dùng `Board` hoặc `Table` lọc theo label `bug`

Đây là cách tôi khuyên dùng nhất.

## Cách map task cho dự án này

Tạo field như sau:

- `Title`
- `Status`
- `Priority`
- `Assignee`
- `Epic`
- `Workspace`
- `Size`
- `Sprint`
- `Start date`
- `Target date`

## Giá trị nên dùng cho field

### `Status`

- `Backlog`
- `Ready`
- `In Progress`
- `Review`
- `Blocked`
- `Done`

### `Priority`

- `P0`
- `P1`
- `P2`
- `P3`

### `Workspace`

- `Customer`
- `Operations`
- `Admin`
- `Backend`
- `Shared`

### `Epic`

- `Epic 1 - Auth`
- `Epic 2 - User`
- `Epic 3 - Vehicle`
- `Epic 4 - Booking`
- `Epic 5 - Operations`
- `Epic 6 - Staff`
- `Epic 7 - Loyalty`
- `Epic 8 - Promotion`
- `Epic 9 - Admin`
- `Epic 10 - Notification`

## Cách nhập task ban đầu

Nên nhập theo Epic trước, rồi tách thành issue nhỏ.

Ví dụ:

- `Setup Next.js frontend skeleton`
- `Setup Spring Boot backend skeleton`
- `Implement auth API contracts`
- `Build customer vehicle pages`
- `Build booking checkout flow`
- `Build staff operations queue`
- `Build admin dashboard shell`

## Cách dùng view

### View 1: `Backlog`

Hiện toàn bộ task.

Group hoặc sort theo:

- `Epic`
- `Priority`
- `Target date`

### View 2: `Sprint Board`

Group theo `Status`:

- Backlog
- Ready
- In Progress
- Review
- Blocked
- Done

### View 3: `Roadmap`

Group theo `Epic`, dùng:

- `Start date`
- `Target date`

Đây là view để nhìn toàn cục.

### View 4: `Bugs`

Filter:

- `label:bug`

hoặc field riêng:

- `Type = Bug`

## Quy trình đề xuất

1. Tạo project bằng `Iterative development` hoặc `Table`
2. Đổi tên project
3. Tạo thêm `Board` view
4. Tạo thêm `Roadmap` view
5. Thêm custom fields
6. Import issues hoặc nhập tay task ban đầu
7. Gắn `Epic`, `Workspace`, `Priority` cho từng task

## Kết luận

Nếu anh muốn ít rối mà vẫn đủ mạnh, dùng:

- `Iterative development` làm nền
- thêm `Roadmap`
- thêm `Bug tracker` sau

Nếu anh muốn cách dễ thao tác nhất ngay bây giờ, dùng:

- `Table`
- thêm `Board`
- thêm `Roadmap`

Với dự án AutoWash Pro hiện tại, tôi nghiêng về:

`Iterative development + Roadmap + Bug tracker`

vì dự án của anh có nhiều Epic, nhiều workspace, và sẽ cần vừa theo sprint vừa theo timeline vừa theo bug.
