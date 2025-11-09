# Manager API Documentation

## Overview
API endpoints dành cho Manager để quản lý món ăn trong hệ thống.

**Base URL:** `http://127.0.0.1:1234/api/manager`

**Authentication:** Tất cả các endpoint yêu cầu JWT token với role `Manager`

---

## Endpoints

### 1. Thêm món ăn mới

**Endpoint:** `POST /api/manager/dishes`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "DishName": "Phở Bò",
  "DishType": "Main Course",
  "DishPrice": 50000,
  "DishDescription": "Phở bò truyền thống Hà Nội",
  "DishImage": "pho-bo.jpg",
  "DishStatus": "Available",
  "IngredientStatus": "Sufficient"
}
```

**Required Fields:**
- `DishName` (string, 2-200 chars): Tên món ăn
- `DishType` (string): Loại món ăn
- `DishPrice` (number, >= 0): Giá món ăn

**Optional Fields:**
- `DishDescription` (string): Mô tả món ăn
- `DishImage` (string): URL/path hình ảnh (default: "default-dish.jpg")
- `DishStatus` (string): "Available" hoặc "Unavailable" (default: "Available")
- `IngredientStatus` (string): "Sufficient" hoặc "Insufficient" (default: "Sufficient")

**Success Response (201):**
```json
{
  "success": true,
  "message": "Thêm món ăn thành công",
  "data": {
    "_id": "673123456789abcdef012345",
    "DishName": "Phở Bò",
    "DishType": "Main Course",
    "DishPrice": 50000,
    "DishDescription": "Phở bò truyền thống Hà Nội",
    "DishImage": "pho-bo.jpg",
    "DishStatus": "Available",
    "IngredientStatus": "Sufficient",
    "CreatedAt": "2025-11-09T10:00:00.000Z",
    "UpdatedAt": "2025-11-09T10:00:00.000Z"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Dữ liệu không hợp lệ
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "msg": "Tên món ăn không được để trống",
      "param": "DishName",
      "location": "body"
    }
  ]
}
```

- **401 Unauthorized** - Token không hợp lệ hoặc không có token
```json
{
  "success": false,
  "message": "Token không hợp lệ"
}
```

- **403 Forbidden** - Không có quyền Manager
```json
{
  "success": false,
  "message": "Chỉ Manager mới có quyền truy cập"
}
```

- **409 Conflict** - Món ăn đã tồn tại
```json
{
  "success": false,
  "message": "Món ăn đã tồn tại"
}
```

---

### 2. Xem chi tiết món ăn

**Endpoint:** `GET /api/manager/dishes/:id`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**
- `id` (string, required): MongoDB ObjectId của món ăn

**Success Response (200):**
```json
{
  "success": true,
  "message": "Lấy thông tin món ăn thành công",
  "data": {
    "_id": "673123456789abcdef012345",
    "DishName": "Phở Bò",
    "DishType": "Main Course",
    "DishPrice": 50000,
    "DishDescription": "Phở bò truyền thống Hà Nội",
    "DishImage": "pho-bo.jpg",
    "DishStatus": "Available",
    "IngredientStatus": "Sufficient",
    "CreatedAt": "2025-11-09T10:00:00.000Z",
    "UpdatedAt": "2025-11-09T10:00:00.000Z"
  }
}
```

**Error Responses:**

- **400 Bad Request** - ID không hợp lệ
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "msg": "ID món ăn không hợp lệ",
      "param": "id",
      "location": "params"
    }
  ]
}
```

- **401 Unauthorized** - Token không hợp lệ
```json
{
  "success": false,
  "message": "Token không hợp lệ"
}
```

- **403 Forbidden** - Không có quyền Manager
```json
{
  "success": false,
  "message": "Chỉ Manager mới có quyền truy cập"
}
```

- **404 Not Found** - Món ăn không tồn tại
```json
{
  "success": false,
  "message": "Món ăn không tồn tại"
}
```

---

## Postman Collection Examples

### 1. POST Create Dish

**URL:** `http://127.0.0.1:1234/api/manager/dishes`

**Method:** POST

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body (raw JSON):**
```json
{
  "DishName": "Phở Bò",
  "DishType": "Main Course",
  "DishPrice": 50000,
  "DishDescription": "Phở bò truyền thống Hà Nội",
  "DishImage": "pho-bo.jpg",
  "DishStatus": "Available",
  "IngredientStatus": "Sufficient"
}
```

### 2. GET Dish Detail

**URL:** `http://127.0.0.1:1234/api/manager/dishes/673123456789abcdef012345`

**Method:** GET

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## Testing Flow

1. **Login as Manager:**
   ```
   POST /api/account/login
   Body: { "email": "manager@gmail.com", "password": "123456" }
   ```
   Save the returned token.

2. **Create a new dish:**
   ```
   POST /api/manager/dishes
   Header: Authorization: Bearer <token>
   Body: { dish data }
   ```

3. **View dish detail:**
   ```
   GET /api/manager/dishes/<dish_id>
   Header: Authorization: Bearer <token>
   ```

---

## Notes

- Tất cả endpoint yêu cầu JWT token hợp lệ với role `Manager`
- Token có thời hạn 7 ngày
- Tên món ăn (`DishName`) phải unique
- `DishPrice` phải >= 0
- `DishStatus` chỉ nhận giá trị "Available" hoặc "Unavailable"
- `IngredientStatus` chỉ nhận giá trị "Sufficient" hoặc "Insufficient"
