# AutoWash Pro

Repository này hiện được sắp lại theo cấu trúc chuẩn trong [PROJECT.md](/D:/CarWash/docs/master/PROJECT.md) để tách rõ frontend, backend và tài liệu điều phối.

## Cấu trúc hiện tại

```text
CarWash/
├── autowash-frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── store/
│       └── types/
├── autowash-backend/
│   └── src/
│       ├── main/java/com/autowash/
│       ├── main/resources/
│       └── test/java/com/autowash/
├── docs/
│   ├── master/
│   ├── context/
│   └── specs/
└── README.md
```

## Tài liệu đã được đặt lại

- Master document: [docs/master/PROJECT.md](/D:/CarWash/docs/master/PROJECT.md)
- Backend context: [docs/context/BACKEND_CONTEXT.md](/D:/CarWash/docs/context/BACKEND_CONTEXT.md)
- Frontend context: [docs/context/FRONTEND_CONTEXT.md](/D:/CarWash/docs/context/FRONTEND_CONTEXT.md)
- API contracts: [docs/specs/autowash_api_contracts.md](/D:/CarWash/docs/specs/autowash_api_contracts.md)
- Prototype behavior spec: [docs/specs/detail.md](/D:/CarWash/docs/specs/detail.md)

## Ghi chú

- `autowash-frontend` được dựng theo cây thư mục Next.js App Router trong tài liệu master.
- `autowash-backend` được dựng theo module structure Spring Boot `com.autowash.*`.
- Các thư mục hiện có `.gitkeep` để giữ khung cấu trúc trước khi bắt đầu thêm source code thực tế.
