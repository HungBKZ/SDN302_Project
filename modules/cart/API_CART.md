# 🛒 Cart API Documentation

## Tổng quan

API này cung cấp các chức năng quản lý giỏ hàng cho khách hàng. Tất cả các API đều yêu cầu authentication (cần token).

**Base URL**: `/api/cart`

---

## 📋 Danh sách API

### UC-11: Thêm món vào giỏ hàng
- **Endpoint**: `POST /api/cart/items`
- **Access**: Private (cần token)
- **Method**: POST

### UC-12: Xem giỏ hàng
- **Endpoint**: `GET /api/cart`
- **Access**: Private (cần token)
- **Method**: GET

### UC-13: Sửa số lượng món
- **Endpoint**: `PUT /api/cart/items/:itemId`
- **Access**: Private (cần token)
- **Method**: PUT

### UC-14: Xóa món khỏi giỏ
- **Endpoint**: `DELETE /api/cart/items/:itemId`
- **Access**: Private (cần token)
- **Method**: DELETE

---

## 🔐 Authentication

Tất cả các API yêu cầu token trong header:

```
Authorization: Bearer <your_token>
```

Token được lấy từ API đăng nhập: `POST /api/account/login`

---

## 📖 Chi tiết từng API

### 1. UC-11: Thêm món vào giỏ hàng

**Endpoint**: `POST /api/cart/items`

**Request Body**:
```json
{
  "dishId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

**Parameters**:
- `dishId` (String, required): ID của món ăn
- `quantity` (Number, optional): Số lượng món ăn (mặc định: 1, phải >= 1)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã thêm món vào giỏ hàng",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "dish": {
      "_id": "507f1f77bcf86cd799439011",
      "DishName": "Phở Bò",
      "DishType": "Main Course",
      "DishPrice": 50000,
      "DishDescription": "Phở bò truyền thống",
      "DishImage": "pho-bo.jpg",
      "DishStatus": "Available",
      "IngredientStatus": "Sufficient"
    },
    "quantity": 2
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Món ăn không tồn tại"
}
```

```json
{
  "success": false,
  "message": "Món ăn hiện không khả dụng"
}
```

```json
{
  "success": false,
  "message": "Món ăn hiện không đủ nguyên liệu"
}
```

```json
{
  "success": false,
  "message": "Số lượng phải là số nguyên >= 1"
}
```

**Validation Errors (400)**:
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "msg": "ID món ăn không được để trống",
      "param": "dishId"
    }
  ]
}
```

**Example cURL**:
```bash
curl -X POST http://127.0.0.1:1234/api/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dishId": "507f1f77bcf86cd799439011",
    "quantity": 2
  }'
```

**Lưu ý**:
- Nếu món đã có trong giỏ, số lượng sẽ được cộng thêm
- Chỉ có thể thêm món có trạng thái "Available"
- Chỉ có thể thêm món có nguyên liệu đủ ("Sufficient")

---

### 2. UC-12: Xem giỏ hàng

**Endpoint**: `GET /api/cart`

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Lấy thông tin giỏ hàng thành công",
  "data": {
    "cart": {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439010",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "items": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "dish": {
          "_id": "507f1f77bcf86cd799439011",
          "DishName": "Phở Bò",
          "DishType": "Main Course",
          "DishPrice": 50000,
          "DishDescription": "Phở bò truyền thống",
          "DishImage": "pho-bo.jpg",
          "DishStatus": "Available",
          "IngredientStatus": "Sufficient"
        },
        "quantity": 2,
        "itemTotal": 100000
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "dish": {
          "_id": "507f1f77bcf86cd799439015",
          "DishName": "Bánh Mì",
          "DishType": "Appetizer",
          "DishPrice": 20000,
          "DishDescription": "Bánh mì thịt nướng",
          "DishImage": "banh-mi.jpg",
          "DishStatus": "Available",
          "IngredientStatus": "Sufficient"
        },
        "quantity": 1,
        "itemTotal": 20000
      }
    ],
    "totalAmount": 120000,
    "totalItems": 2
  }
}
```

**Example cURL**:
```bash
curl -X GET http://127.0.0.1:1234/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Lưu ý**:
- Nếu giỏ hàng trống, `items` sẽ là mảng rỗng
- `totalAmount` là tổng tiền của tất cả món trong giỏ
- `totalItems` là số lượng loại món khác nhau trong giỏ

---

### 3. UC-13: Sửa số lượng món

**Endpoint**: `PUT /api/cart/items/:itemId`

**URL Parameters**:
- `itemId` (String, required): ID của món trong giỏ hàng (CartItem ID)

**Request Body**:
```json
{
  "quantity": 3
}
```

**Parameters**:
- `quantity` (Number, required): Số lượng mới (phải >= 1)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã cập nhật số lượng món",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "dish": {
      "_id": "507f1f77bcf86cd799439011",
      "DishName": "Phở Bò",
      "DishType": "Main Course",
      "DishPrice": 50000,
      "DishDescription": "Phở bò truyền thống",
      "DishImage": "pho-bo.jpg",
      "DishStatus": "Available",
      "IngredientStatus": "Sufficient"
    },
    "quantity": 3
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Món không tồn tại trong giỏ hàng"
}
```

```json
{
  "success": false,
  "message": "Bạn không có quyền sửa món này"
}
```

```json
{
  "success": false,
  "message": "Món ăn hiện không khả dụng"
}
```

```json
{
  "success": false,
  "message": "Số lượng phải là số nguyên >= 1"
}
```

**Validation Errors (400)**:
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "msg": "Số lượng không được để trống",
      "param": "quantity"
    }
  ]
}
```

**Example cURL**:
```bash
curl -X PUT http://127.0.0.1:1234/api/cart/items/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'
```

**Lưu ý**:
- Chỉ có thể sửa số lượng món trong giỏ hàng của chính mình
- Số lượng phải >= 1
- Kiểm tra món ăn vẫn còn khả dụng trước khi cập nhật

---

### 4. UC-14: Xóa món khỏi giỏ

**Endpoint**: `DELETE /api/cart/items/:itemId`

**URL Parameters**:
- `itemId` (String, required): ID của món trong giỏ hàng (CartItem ID)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã xóa món khỏi giỏ hàng",
  "data": {
    "itemId": "507f1f77bcf86cd799439012"
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Món không tồn tại trong giỏ hàng"
}
```

```json
{
  "success": false,
  "message": "Bạn không có quyền xóa món này"
}
```

**Validation Errors (400)**:
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "msg": "ID món trong giỏ không hợp lệ",
      "param": "itemId"
    }
  ]
}
```

**Example cURL**:
```bash
curl -X DELETE http://127.0.0.1:1234/api/cart/items/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Lưu ý**:
- Chỉ có thể xóa món trong giỏ hàng của chính mình
- Sau khi xóa, món sẽ được loại bỏ hoàn toàn khỏi giỏ hàng

---

## 🔄 Flow sử dụng

### 1. Thêm món vào giỏ
```bash
# 1. Đăng nhập để lấy token
POST /api/account/login

# 2. Thêm món vào giỏ
POST /api/cart/items
{
  "dishId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

### 2. Xem giỏ hàng
```bash
GET /api/cart
```

### 3. Sửa số lượng
```bash
PUT /api/cart/items/:itemId
{
  "quantity": 3
}
```

### 4. Xóa món
```bash
DELETE /api/cart/items/:itemId
```

---

## ⚠️ Lưu ý quan trọng

1. **Authentication**: Tất cả API yêu cầu token trong header `Authorization: Bearer <token>`
2. **Validation**: Tất cả input đều được validate trước khi xử lý
3. **Quyền truy cập**: Chỉ có thể thao tác với giỏ hàng của chính mình
4. **Trạng thái món**: Chỉ có thể thêm/sửa món có trạng thái "Available" và nguyên liệu "Sufficient"
5. **Unique Index**: Mỗi món chỉ có một dòng trong giỏ hàng (nếu thêm lại sẽ cộng dồn số lượng)
6. **Auto-create Cart**: Giỏ hàng sẽ tự động được tạo khi thêm món đầu tiên

---

## 🧪 Test với Postman

### Import Collection
1. Tạo collection mới trong Postman
2. Thêm các request sau:
   - `POST /api/cart/items` - Thêm món vào giỏ
   - `GET /api/cart` - Xem giỏ hàng
   - `PUT /api/cart/items/:itemId` - Sửa số lượng
   - `DELETE /api/cart/items/:itemId` - Xóa món

### Setup Variables
- `base_url`: `http://127.0.0.1:1234`
- `token`: Token từ API login

### Test Flow
1. Login để lấy token
2. Thêm món vào giỏ
3. Xem giỏ hàng
4. Sửa số lượng món
5. Xóa món khỏi giỏ

---

## 📝 Response Codes

- **200**: Success
- **400**: Bad Request (validation error, business logic error)
- **401**: Unauthorized (thiếu token)
- **403**: Forbidden (token không hợp lệ)
- **404**: Not Found (route không tồn tại)
- **500**: Internal Server Error

---

**Made with ❤️ for SDN302 Project**

