# API Thêm Món Mới - Dành cho Manager

## Endpoint
```
POST http://127.0.0.1:1234/api/menu
```

## Authentication
- **Required**: YES
- **Role**: Manager
- **Header**: `Authorization: Bearer <JWT_TOKEN>`

## Request Body (JSON)

### Required Fields:
```json
{
  "DishName": "Phở Bò",
  "DishType": "Main Course",
  "DishPrice": 50000
}
```

### Full Example:
```json
{
  "DishName": "Phở Bò Đặc Biệt",
  "DishType": "Main Course",
  "DishPrice": 75000,
  "DishDescription": "Phở bò với đầy đủ topping: tái, nạm, gầu, gân",
  "DishImage": "pho-bo-dac-biet.jpg",
  "DishStatus": "Available",
  "IngredientStatus": "Sufficient"
}
```

### Optional Fields:
- `DishDescription`: Mô tả món ăn (tối đa 500 ký tự)
- `DishImage`: Tên file hình ảnh (mặc định: "default-dish.jpg")
- `DishStatus`: "Available" hoặc "Unavailable" (mặc định: "Available")
- `IngredientStatus`: "Sufficient" hoặc "Insufficient" (mặc định: "Sufficient")

## Response

### Success (201 Created):
```json
{
  "success": true,
  "message": "Thêm món ăn mới thành công",
  "data": {
    "_id": "673f123abc...",
    "DishName": "Phở Bò Đặc Biệt",
    "DishType": "Main Course",
    "DishPrice": 75000,
    "DishDescription": "Phở bò với đầy đủ topping: tái, nạm, gầu, gân",
    "DishImage": "pho-bo-dac-biet.jpg",
    "DishStatus": "Available",
    "IngredientStatus": "Sufficient",
    "CreatedAt": "2025-11-09T10:30:00.000Z",
    "UpdatedAt": "2025-11-09T10:30:00.000Z"
  }
}
```

### Error - Unauthorized (401):
```json
{
  "success": false,
  "message": "Unauthorized - Vui lòng đăng nhập"
}
```

### Error - Forbidden (403):
```json
{
  "success": false,
  "message": "Forbidden - Chỉ Manager mới có quyền truy cập"
}
```

### Error - Món ăn đã tồn tại (409):
```json
{
  "success": false,
  "message": "Món ăn đã tồn tại trong hệ thống"
}
```

### Error - Validation (400):
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

## Test với Postman/Thunder Client

### 1. Lấy JWT Token (đăng nhập với tài khoản Manager)
```
POST http://127.0.0.1:1234/api/auth/login
```

### 2. Thêm món mới
- Method: **POST**
- URL: `http://127.0.0.1:1234/api/menu`
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_JWT_TOKEN_HERE`
- Body (raw JSON):
```json
{
  "DishName": "Cơm Gà Xối Mỡ",
  "DishType": "Main Course",
  "DishPrice": 45000,
  "DishDescription": "Cơm gà luộc với xương ống, ăn kèm nước mắm gừng",
  "DishStatus": "Available",
  "IngredientStatus": "Sufficient"
}
```

## Validation Rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| DishName | String | Yes | 2-100 ký tự |
| DishType | String | Yes | Không được trống |
| DishPrice | Number | Yes | ≥ 0 |
| DishDescription | String | No | ≤ 500 ký tự |
| DishImage | String | No | - |
| DishStatus | String | No | "Available" hoặc "Unavailable" |
| IngredientStatus | String | No | "Sufficient" hoặc "Insufficient" |

## Ghi chú
- Chỉ tài khoản có role **Manager** mới có thể thêm món mới
- Không thể thêm món trùng tên (case-sensitive)
- Token JWT phải hợp lệ và chưa hết hạn
