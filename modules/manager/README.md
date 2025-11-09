# Manager Module - Tóm tắt

## Tính năng đã triển khai

### 1. Thêm món mới (Create Dish)
- **Endpoint:** `POST /api/manager/dishes`
- **Quyền:** Manager only
- **Chức năng:** Tạo món ăn mới trong hệ thống

### 2. Xem chi tiết món ăn (Get Dish Detail)
- **Endpoint:** `GET /api/manager/dishes/:id`
- **Quyền:** Manager only
- **Chức năng:** Xem thông tin chi tiết của một món ăn

## Cấu trúc Module

```
modules/manager/
├── manager.service.js      # Business logic
├── manager.controller.js   # Request handlers
├── manager.validation.js   # Input validation
├── manager.router.js       # Route definitions
├── API_MANAGER.md         # API documentation
├── POSTMAN_MANAGER.json   # Postman collection
└── README.md              # This file
```

## Files đã tạo/sửa

### Created:
1. `src/modules/manager/manager.service.js` - Service layer với 2 methods:
   - `createDish(dishData)` - Tạo món mới
   - `getDishDetail(dishId)` - Lấy chi tiết món

2. `src/modules/manager/manager.controller.js` - Controller với 2 endpoints:
   - `createDish` - POST handler
   - `getDishDetail` - GET handler

3. `src/modules/manager/manager.validation.js` - Validation rules:
   - `validateCreateDish` - Validate dữ liệu tạo món
   - `validateDishId` - Validate MongoDB ObjectId

4. `src/modules/manager/manager.router.js` - Routes với middleware:
   - `auth` - Xác thực JWT
   - `isManager` - Kiểm tra role Manager

5. `src/modules/manager/API_MANAGER.md` - Chi tiết API documentation

6. `src/modules/manager/POSTMAN_MANAGER.json` - Postman collection để test

### Modified:
1. `src/loaders/routes.js` - Đã thêm manager router vào app

## Validation Rules

### Create Dish (POST):
- **DishName** (required): string, 2-200 chars
- **DishType** (required): string
- **DishPrice** (required): number >= 0
- **DishDescription** (optional): string
- **DishImage** (optional): string, default "default-dish.jpg"
- **DishStatus** (optional): "Available" | "Unavailable", default "Available"
- **IngredientStatus** (optional): "Sufficient" | "Insufficient", default "Sufficient"

### Get Dish Detail (GET):
- **id** (param, required): valid MongoDB ObjectId

## Testing với Postman

### Bước 1: Import Collection
Import file `POSTMAN_MANAGER.json` vào Postman

### Bước 2: Chạy theo thứ tự
1. **Login as Manager** - Lấy token (tự động save vào variable)
2. **Create Dish** - Tạo món mới (tự động save dishId)
3. **Get Dish Detail** - Xem chi tiết món vừa tạo

### Bước 3: Test cases có sẵn
- Create với full fields
- Create với minimal fields (chỉ required)
- Create với validation errors (để test lỗi)

## Quick Test Commands

### 1. Tạo món mới (cần token)
```bash
curl -X POST http://127.0.0.1:1234/api/manager/dishes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "DishName": "Phở Bò",
    "DishType": "Main Course",
    "DishPrice": 50000
  }'
```

### 2. Xem chi tiết món (cần token)
```bash
curl http://127.0.0.1:1234/api/manager/dishes/DISH_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

### Service Layer:
- Kiểm tra món ăn trùng tên → throw Error('Món ăn đã tồn tại')
- Kiểm tra món không tồn tại → throw Error('Món ăn không tồn tại')

### Controller Layer:
- 201: Tạo thành công
- 200: Lấy thành công
- 400: Validation error
- 401: Unauthorized (no token/invalid token)
- 403: Forbidden (not Manager role)
- 404: Món ăn không tồn tại
- 409: Món ăn đã tồn tại
- 500: Internal server error

## Dependencies

Module này sử dụng:
- `express` - Web framework
- `express-validator` - Input validation
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT auth (via auth middleware)

## Middleware Stack

```
Request → auth → isManager → validation → controller → service → Dish model
```

## Notes

- **Không sửa Model Dish**: Sử dụng model hiện có trong `src/models/Dish.js`
- **Authentication**: Tất cả endpoint yêu cầu JWT token hợp lệ
- **Authorization**: Chỉ Manager role mới được truy cập
- **Unique constraint**: DishName phải unique (check trong service)
- **Default values**: DishImage, DishStatus, IngredientStatus có giá trị mặc định
