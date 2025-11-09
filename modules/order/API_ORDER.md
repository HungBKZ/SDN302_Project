# 📦 Order API Documentation

## Tổng quan

API này cung cấp các chức năng quản lý đơn hàng cho khách hàng (Guest/Member) và nhân viên (Staff/Kitchen Staff/Manager). Một số API yêu cầu authentication, một số không (Guest có thể sử dụng).

**Base URL**: `/api/order`

---

## 📋 Danh sách API

### UC-1: Tạo order
- **Endpoint**: `POST /api/order` - Tạo order mới (Guest/Member)
- **Endpoint**: `POST /api/order/from-cart` - Tạo order từ giỏ hàng (Member)

### UC-2: Xem menu trong order
- **Endpoint**: `GET /api/order/:orderId/menu` - Xem menu trong order (Guest/Member)

### UC-3: Thêm món vào order
- **Endpoint**: `POST /api/order/:orderId/items` - Thêm món vào order (Guest/Member)

### UC-4: Sửa số lượng món
- **Endpoint**: `PUT /api/order/:orderId/items/:itemId` - Sửa số lượng món (Guest/Member)

### UC-5: Xóa món trong order
- **Endpoint**: `DELETE /api/order/:orderId/items/:itemId` - Xóa món (chưa chế biến) (Guest/Member)

### UC-6: Xem lịch sử đặt món
- **Endpoint**: `GET /api/order/history` - Xem lịch sử (Member)

### UC-7: Xóa lịch sử đơn hàng
- **Endpoint**: `DELETE /api/order/:orderId/history` - Xóa lịch sử (Member)

### UC-8: Đặt lại từ lịch sử
- **Endpoint**: `POST /api/order/:orderId/reorder` - Re-order (Member)

### UC-9: Nhận thông báo order mới
- **Endpoint**: `GET /api/order/new` - Lấy danh sách orders mới (Staff/Kitchen Staff)

### UC-10: Cập nhật trạng thái order
- **Endpoint**: `PUT /api/order/:orderId/status` - Cập nhật trạng thái (Staff/Kitchen Staff/Manager)

---

## 🔐 Authentication

### Guest (Không cần token)
Các API sau cho phép Guest sử dụng (không cần token):
- `POST /api/order` - Tạo order
- `GET /api/order/:orderId/menu` - Xem menu trong order
- `POST /api/order/:orderId/items` - Thêm món
- `PUT /api/order/:orderId/items/:itemId` - Sửa số lượng
- `DELETE /api/order/:orderId/items/:itemId` - Xóa món

### Member (Cần token)
Các API sau yêu cầu token:
- `POST /api/order/from-cart` - Tạo order từ giỏ hàng
- `GET /api/order/history` - Xem lịch sử
- `DELETE /api/order/:orderId/history` - Xóa lịch sử
- `POST /api/order/:orderId/reorder` - Re-order

### Staff/Kitchen Staff/Manager (Cần token + role)
Các API sau yêu cầu token và role cụ thể:
- `GET /api/order/new` - Lấy orders mới (Staff/Kitchen Staff)
- `PUT /api/order/:orderId/status` - Cập nhật trạng thái (Staff/Kitchen Staff/Manager)

**Token format**:
```
Authorization: Bearer <your_token>
```

---

## 📖 Chi tiết từng API

### 1. UC-1: Tạo order mới (Guest/Member)

#### 1.1. POST /api/order - Tạo order mới

**Endpoint**: `POST /api/order`

**Access**: Public (optional auth - Guest/Member)

**Request Body**:
```json
{
  "OrderType": "Dine-in",
  "TableId": "507f1f77bcf86cd799439011",
  "CustomerPhone": "0123456789",
  "OrderDescription": "Đơn hàng cho bàn số 5",
  "items": [
    {
      "dishId": "507f1f77bcf86cd799439012",
      "quantity": 2
    },
    {
      "dishId": "507f1f77bcf86cd799439013",
      "quantity": 1
    }
  ]
}
```

**Parameters**:
- `OrderType` (String, optional): Loại đơn hàng - "Dine-in" hoặc "Takeaway" (mặc định: "Dine-in")
- `TableId` (String, optional): ID của bàn (null nếu Takeaway)
- `CustomerPhone` (String, optional): Số điện thoại khách hàng (10-11 chữ số)
- `OrderDescription` (String, optional): Mô tả đơn hàng
- `items` (Array, optional): Danh sách món ăn
  - `dishId` (String, required): ID của món ăn
  - `quantity` (Number, required): Số lượng (>= 1)

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "UserId": null,
    "CustomerId": null,
    "TableId": {
      "_id": "507f1f77bcf86cd799439011",
      "TableStatus": "Available",
      "NumberOfSeats": 4
    },
    "OrderType": "Dine-in",
    "OrderStatus": "Pending",
    "OrderDescription": "Đơn hàng cho bàn số 5",
    "CustomerPhone": "0123456789",
    "Total": 150000,
    "FinalPrice": 150000,
    "OrderDate": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Bàn không tồn tại"
}
```

```json
{
  "success": false,
  "message": "Món ăn với ID 507f1f77bcf86cd799439012 không tồn tại"
}
```

**Example cURL (Guest)**:
```bash
curl -X POST http://127.0.0.1:1234/api/order \
  -H "Content-Type: application/json" \
  -d '{
    "OrderType": "Dine-in",
    "items": [
      {
        "dishId": "507f1f77bcf86cd799439012",
        "quantity": 2
      }
    ]
  }'
```

**Example cURL (Member)**:
```bash
curl -X POST http://127.0.0.1:1234/api/order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "OrderType": "Dine-in",
    "TableId": "507f1f77bcf86cd799439011",
    "items": [
      {
        "dishId": "507f1f77bcf86cd799439012",
        "quantity": 2
      }
    ]
  }'
```

#### 1.2. POST /api/order/from-cart - Tạo order từ giỏ hàng

**Endpoint**: `POST /api/order/from-cart`

**Access**: Private (cần token - Member)

**Request Body**:
```json
{
  "OrderType": "Dine-in",
  "TableId": "507f1f77bcf86cd799439011",
  "OrderDescription": "Đơn hàng từ giỏ hàng"
}
```

**Parameters**:
- `OrderType` (String, optional): Loại đơn hàng (mặc định: "Dine-in")
- `TableId` (String, optional): ID của bàn
- `OrderDescription` (String, optional): Mô tả đơn hàng

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Tạo đơn hàng từ giỏ hàng thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "UserId": "507f1f77bcf86cd799439010",
    "CustomerId": "507f1f77bcf86cd799439010",
    "TableId": {
      "_id": "507f1f77bcf86cd799439011",
      "TableStatus": "Available",
      "NumberOfSeats": 4
    },
    "OrderType": "Dine-in",
    "OrderStatus": "Pending",
    "Total": 150000,
    "FinalPrice": 150000,
    "OrderDate": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Giỏ hàng trống"
}
```

**Example cURL**:
```bash
curl -X POST http://127.0.0.1:1234/api/order/from-cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "OrderType": "Dine-in",
    "TableId": "507f1f77bcf86cd799439011"
  }'
```

**Lưu ý**:
- Sau khi tạo order từ giỏ hàng, giỏ hàng sẽ bị xóa
- Chỉ có thể tạo order từ giỏ hàng khi đã đăng nhập (Member)

---

### 2. UC-2: Xem menu trong order

**Endpoint**: `GET /api/order/:orderId/menu`

**Access**: Public (optional auth - Guest/Member)

**URL Parameters**:
- `orderId` (String, required): ID của order

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Lấy thông tin đơn hàng thành công",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439014",
      "OrderDate": "2024-01-01T00:00:00.000Z",
      "OrderStatus": "Pending",
      "OrderType": "Dine-in",
      "OrderDescription": "Đơn hàng cho bàn số 5",
      "TableId": {
        "_id": "507f1f77bcf86cd799439011",
        "TableStatus": "Available",
        "NumberOfSeats": 4
      },
      "UserId": null,
      "Total": 150000,
      "FinalPrice": 150000
    },
    "items": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "dish": {
          "_id": "507f1f77bcf86cd799439012",
          "DishName": "Phở Bò",
          "DishType": "Main Course",
          "DishPrice": 50000,
          "DishDescription": "Phở bò truyền thống",
          "DishImage": "pho-bo.jpg"
        },
        "quantity": 2,
        "unitPrice": 50000,
        "itemTotal": 100000
      },
      {
        "_id": "507f1f77bcf86cd799439016",
        "dish": {
          "_id": "507f1f77bcf86cd799439013",
          "DishName": "Bánh Mì",
          "DishType": "Appetizer",
          "DishPrice": 50000,
          "DishDescription": "Bánh mì thịt nướng",
          "DishImage": "banh-mi.jpg"
        },
        "quantity": 1,
        "unitPrice": 50000,
        "itemTotal": 50000
      }
    ],
    "totalItems": 2
  }
}
```

**Response Error (404)**:
```json
{
  "success": false,
  "message": "Đơn hàng không tồn tại"
}
```

**Example cURL (Guest)**:
```bash
curl -X GET http://127.0.0.1:1234/api/order/507f1f77bcf86cd799439014/menu
```

**Example cURL (Member)**:
```bash
curl -X GET http://127.0.0.1:1234/api/order/507f1f77bcf86cd799439014/menu \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. UC-3: Thêm món vào order

**Endpoint**: `POST /api/order/:orderId/items`

**Access**: Public (optional auth - Guest/Member)

**URL Parameters**:
- `orderId` (String, required): ID của order

**Request Body**:
```json
{
  "dishId": "507f1f77bcf86cd799439012",
  "quantity": 2
}
```

**Parameters**:
- `dishId` (String, required): ID của món ăn
- `quantity` (Number, required): Số lượng (>= 1)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã thêm món vào đơn hàng",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "dish": {
      "_id": "507f1f77bcf86cd799439012",
      "DishName": "Phở Bò",
      "DishPrice": 50000
    },
    "quantity": 2,
    "unitPrice": 50000
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Chỉ có thể thêm món khi đơn hàng ở trạng thái Pending"
}
```

**Example cURL**:
```bash
curl -X POST http://127.0.0.1:1234/api/order/507f1f77bcf86cd799439014/items \
  -H "Content-Type: application/json" \
  -d '{
    "dishId": "507f1f77bcf86cd799439012",
    "quantity": 2
  }'
```

**Lưu ý**:
- Chỉ có thể thêm món khi order ở trạng thái "Pending"
- Nếu món đã có trong order, số lượng sẽ được cộng thêm
- Tổng tiền sẽ được tự động tính lại

---

### 4. UC-4: Sửa số lượng món

**Endpoint**: `PUT /api/order/:orderId/items/:itemId`

**Access**: Public (optional auth - Guest/Member)

**URL Parameters**:
- `orderId` (String, required): ID của order
- `itemId` (String, required): ID của OrderItem

**Request Body**:
```json
{
  "quantity": 3
}
```

**Parameters**:
- `quantity` (Number, required): Số lượng mới (>= 1)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã cập nhật số lượng món",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "dish": {
      "_id": "507f1f77bcf86cd799439012",
      "DishName": "Phở Bò",
      "DishPrice": 50000
    },
    "quantity": 3,
    "unitPrice": 50000
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Chỉ có thể sửa món khi đơn hàng ở trạng thái Pending"
}
```

**Example cURL**:
```bash
curl -X PUT http://127.0.0.1:1234/api/order/507f1f77bcf86cd799439014/items/507f1f77bcf86cd799439015 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'
```

**Lưu ý**:
- Chỉ có thể sửa số lượng khi order ở trạng thái "Pending"
- Tổng tiền sẽ được tự động tính lại

---

### 5. UC-5: Xóa món trong order

**Endpoint**: `DELETE /api/order/:orderId/items/:itemId`

**Access**: Public (optional auth - Guest/Member)

**URL Parameters**:
- `orderId` (String, required): ID của order
- `itemId` (String, required): ID của OrderItem

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã xóa món khỏi đơn hàng",
  "data": {
    "itemId": "507f1f77bcf86cd799439015"
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Chỉ có thể xóa món khi đơn hàng ở trạng thái Pending (chưa chế biến)"
}
```

**Example cURL**:
```bash
curl -X DELETE http://127.0.0.1:1234/api/order/507f1f77bcf86cd799439014/items/507f1f77bcf86cd799439015
```

**Lưu ý**:
- Chỉ có thể xóa món khi order ở trạng thái "Pending" (chưa chế biến)
- Tổng tiền sẽ được tự động tính lại

---

### 6. UC-6: Xem lịch sử đặt món

**Endpoint**: `GET /api/order/history`

**Access**: Private (cần token - Member)

**Query Parameters**:
- `page` (Number, optional): Trang hiện tại (mặc định: 1)
- `limit` (Number, optional): Số lượng orders mỗi trang (mặc định: 10, tối đa: 100)
- `status` (String, optional): Lọc theo trạng thái - "Pending", "Preparing", "Ready", "Completed", "Cancelled"

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Lấy lịch sử đơn hàng thành công",
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "OrderDate": "2024-01-01T00:00:00.000Z",
        "OrderStatus": "Completed",
        "OrderType": "Dine-in",
        "TableId": {
          "_id": "507f1f77bcf86cd799439011",
          "TableStatus": "Available"
        },
        "Total": 150000,
        "FinalPrice": 150000,
        "items": [
          {
            "dish": {
              "_id": "507f1f77bcf86cd799439012",
              "DishName": "Phở Bò",
              "DishPrice": 50000
            },
            "quantity": 2,
            "unitPrice": 50000,
            "itemTotal": 100000
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
    }
  }
}
```

**Example cURL**:
```bash
curl -X GET "http://127.0.0.1:1234/api/order/history?page=1&limit=10&status=Completed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Lưu ý**:
- Chỉ hiển thị orders của chính user đã đăng nhập
- Có thể lọc theo trạng thái order

---

### 7. UC-7: Xóa lịch sử đơn hàng

**Endpoint**: `DELETE /api/order/:orderId/history`

**Access**: Private (cần token - Member)

**URL Parameters**:
- `orderId` (String, required): ID của order

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Đã xóa đơn hàng khỏi lịch sử",
  "data": {
    "orderId": "507f1f77bcf86cd799439014"
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Chỉ có thể xóa đơn hàng đã hoàn thành hoặc đã hủy"
}
```

**Example cURL**:
```bash
curl -X DELETE http://127.0.0.1:1234/api/order/507f1f77bcf86cd799439014/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Lưu ý**:
- Chỉ có thể xóa orders đã "Completed" hoặc "Cancelled"
- Chỉ có thể xóa orders của chính mình

---

### 8. UC-8: Đặt lại (Re-order) từ lịch sử

**Endpoint**: `POST /api/order/:orderId/reorder`

**Access**: Private (cần token - Member)

**URL Parameters**:
- `orderId` (String, required): ID của order cũ

**Request Body**:
```json
{
  "OrderType": "Dine-in",
  "TableId": "507f1f77bcf86cd799439011",
  "OrderDescription": "Re-order từ đơn hàng #507f1f77bcf86cd799439014"
}
```

**Parameters**:
- `OrderType` (String, optional): Loại đơn hàng mới
- `TableId` (String, optional): ID của bàn mới
- `OrderDescription` (String, optional): Mô tả đơn hàng mới

**Response Success (201)**:
```json
{
  "success": true,
  "message": "Đặt lại đơn hàng thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439017",
    "UserId": "507f1f77bcf86cd799439010",
    "OrderType": "Dine-in",
    "OrderStatus": "Pending",
    "OrderDescription": "Re-order từ đơn hàng #507f1f77bcf86cd799439014",
    "Total": 150000,
    "FinalPrice": 150000,
    "OrderDate": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Món Phở Bò hiện không khả dụng"
}
```

**Example cURL**:
```bash
curl -X POST http://127.0.0.1:1234/api/order/507f1f77bcf86cd799439014/reorder \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "OrderType": "Dine-in",
    "TableId": "507f1f77bcf86cd799439011"
  }'
```

**Lưu ý**:
- Tạo order mới với các món từ order cũ
- Kiểm tra món còn available và đủ nguyên liệu
- Chỉ có thể re-order từ orders của chính mình

---

### 9. UC-9: Nhận thông báo order mới

**Endpoint**: `GET /api/order/new`

**Access**: Private (cần token + role Staff/Kitchen Staff)

**Query Parameters**:
- `page` (Number, optional): Trang hiện tại (mặc định: 1)
- `limit` (Number, optional): Số lượng orders mỗi trang (mặc định: 20, tối đa: 100)

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Lấy danh sách đơn hàng mới thành công",
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "OrderDate": "2024-01-01T00:00:00.000Z",
        "OrderStatus": "Pending",
        "OrderType": "Dine-in",
        "TableId": {
          "_id": "507f1f77bcf86cd799439011",
          "TableStatus": "Available"
        },
        "UserId": {
          "_id": "507f1f77bcf86cd799439010",
          "Name": "Nguyễn Văn A"
        },
        "Total": 150000,
        "FinalPrice": 150000,
        "items": [
          {
            "dish": {
              "_id": "507f1f77bcf86cd799439012",
              "DishName": "Phở Bò",
              "DishPrice": 50000
            },
            "quantity": 2,
            "unitPrice": 50000
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  }
}
```

**Response Error (403)**:
```json
{
  "success": false,
  "message": "Forbidden - Chỉ Waiter, Kitchen staff mới có quyền truy cập"
}
```

**Example cURL**:
```bash
curl -X GET "http://127.0.0.1:1234/api/order/new?page=1&limit=20" \
  -H "Authorization: Bearer STAFF_TOKEN"
```

**Lưu ý**:
- Chỉ hiển thị orders có trạng thái "Pending"
- Chỉ Staff và Kitchen Staff mới có quyền truy cập

---

### 10. UC-10: Cập nhật trạng thái order

**Endpoint**: `PUT /api/order/:orderId/status`

**Access**: Private (cần token + role Staff/Kitchen Staff/Manager)

**URL Parameters**:
- `orderId` (String, required): ID của order

**Request Body**:
```json
{
  "status": "Preparing"
}
```

**Parameters**:
- `status` (String, required): Trạng thái mới - "Pending", "Preparing", "Ready", "Completed", "Cancelled"

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439014",
      "OrderStatus": "Preparing",
      "OrderDate": "2024-01-01T00:00:00.000Z",
      "OrderType": "Dine-in",
      "Total": 150000,
      "FinalPrice": 150000,
      "items": [
        {
          "dish": {
            "_id": "507f1f77bcf86cd799439012",
            "DishName": "Phở Bò",
            "DishPrice": 50000
          },
          "quantity": 2,
          "unitPrice": 50000
        }
      ]
    }
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "message": "Trạng thái không hợp lệ. Các trạng thái hợp lệ: Pending, Preparing, Ready, Completed, Cancelled"
}
```

**Example cURL**:
```bash
curl -X PUT http://127.0.0.1:1234/api/order/507f1f77bcf86cd799439014/status \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Preparing"
  }'
```

**Lưu ý**:
- Chỉ Staff, Kitchen Staff và Manager mới có quyền cập nhật trạng thái
- Các trạng thái hợp lệ: "Pending", "Preparing", "Ready", "Completed", "Cancelled"

---

## 🔄 Flow sử dụng

### 1. Guest tạo order
```bash
# 1. Tạo order (không cần đăng nhập)
POST /api/order
{
  "OrderType": "Dine-in",
  "items": [
    {
      "dishId": "507f1f77bcf86cd799439012",
      "quantity": 2
    }
  ]
}

# 2. Xem menu trong order
GET /api/order/:orderId/menu

# 3. Thêm món vào order
POST /api/order/:orderId/items
{
  "dishId": "507f1f77bcf86cd799439013",
  "quantity": 1
}

# 4. Sửa số lượng món
PUT /api/order/:orderId/items/:itemId
{
  "quantity": 3
}

# 5. Xóa món
DELETE /api/order/:orderId/items/:itemId
```

### 2. Member tạo order từ giỏ hàng
```bash
# 1. Đăng nhập để lấy token
POST /api/account/login

# 2. Thêm món vào giỏ hàng
POST /api/cart/items
{
  "dishId": "507f1f77bcf86cd799439012",
  "quantity": 2
}

# 3. Tạo order từ giỏ hàng
POST /api/order/from-cart
{
  "OrderType": "Dine-in",
  "TableId": "507f1f77bcf86cd799439011"
}

# 4. Xem lịch sử đơn hàng
GET /api/order/history

# 5. Re-order từ lịch sử
POST /api/order/:orderId/reorder
{
  "OrderType": "Dine-in",
  "TableId": "507f1f77bcf86cd799439011"
}
```

### 3. Staff quản lý order
```bash
# 1. Đăng nhập với tài khoản Staff
POST /api/account/login

# 2. Xem danh sách orders mới
GET /api/order/new

# 3. Cập nhật trạng thái order
PUT /api/order/:orderId/status
{
  "status": "Preparing"
}

# 4. Cập nhật trạng thái tiếp theo
PUT /api/order/:orderId/status
{
  "status": "Ready"
}
```

---

## 📊 Trạng thái Order

| Trạng thái | Mô tả | Có thể sửa/xóa món? |
|-----------|-------|---------------------|
| **Pending** | Chờ xử lý | ✅ Có |
| **Preparing** | Đang chế biến | ❌ Không |
| **Ready** | Sẵn sàng | ❌ Không |
| **Completed** | Hoàn thành | ❌ Không |
| **Cancelled** | Đã hủy | ❌ Không |

---

## ⚠️ Lưu ý quan trọng

1. **Guest vs Member**:
   - Guest: Không cần đăng nhập, có thể tạo và quản lý order
   - Member: Cần đăng nhập, có thể tạo order từ giỏ hàng, xem lịch sử, re-order

2. **Quyền truy cập**:
   - Guest/Member: Chỉ có thể sửa/xóa orders của chính mình (hoặc orders không có UserId)
   - Staff/Kitchen Staff: Có thể xem orders mới và cập nhật trạng thái
   - Manager: Có thể cập nhật trạng thái order

3. **Trạng thái Order**:
   - Chỉ có thể thêm/sửa/xóa món khi order ở trạng thái "Pending"
   - Sau khi order chuyển sang "Preparing", không thể sửa/xóa món nữa

4. **Validation**:
   - Tất cả input đều được validate trước khi xử lý
   - Kiểm tra món available và đủ nguyên liệu trước khi thêm vào order
   - Tổng tiền được tự động tính lại khi thêm/sửa/xóa món

5. **Tạo order từ giỏ hàng**:
   - Sau khi tạo order từ giỏ hàng, giỏ hàng sẽ bị xóa
   - Chỉ Member mới có thể tạo order từ giỏ hàng

6. **Re-order**:
   - Chỉ có thể re-order từ orders đã hoàn thành hoặc đã hủy
   - Kiểm tra món còn available và đủ nguyên liệu trước khi re-order

---

## 🧪 Test với Postman

### Import Collection
1. Tạo collection mới trong Postman tên "Order API"
2. Thêm các request sau:
   - `POST /api/order` - Tạo order
   - `POST /api/order/from-cart` - Tạo order từ giỏ hàng
   - `GET /api/order/:orderId/menu` - Xem menu trong order
   - `POST /api/order/:orderId/items` - Thêm món
   - `PUT /api/order/:orderId/items/:itemId` - Sửa số lượng
   - `DELETE /api/order/:orderId/items/:itemId` - Xóa món
   - `GET /api/order/history` - Xem lịch sử
   - `DELETE /api/order/:orderId/history` - Xóa lịch sử
   - `POST /api/order/:orderId/reorder` - Re-order
   - `GET /api/order/new` - Lấy orders mới
   - `PUT /api/order/:orderId/status` - Cập nhật trạng thái

### Setup Variables
- `base_url`: `http://127.0.0.1:1234`
- `token`: Token từ API login
- `orderId`: ID của order (sau khi tạo)
- `itemId`: ID của OrderItem (sau khi thêm món)

### Test Flow

#### Test Guest Order
1. Tạo order (không cần token)
2. Xem menu trong order
3. Thêm món vào order
4. Sửa số lượng món
5. Xóa món khỏi order

#### Test Member Order
1. Login để lấy token
2. Thêm món vào giỏ hàng
3. Tạo order từ giỏ hàng
4. Xem lịch sử đơn hàng
5. Re-order từ lịch sử

#### Test Staff Order Management
1. Login với tài khoản Staff
2. Xem danh sách orders mới
3. Cập nhật trạng thái order (Pending -> Preparing -> Ready -> Completed)

---

## 📝 Response Codes

- **200**: Success
- **201**: Created (tạo mới thành công)
- **400**: Bad Request (validation error, business logic error)
- **401**: Unauthorized (thiếu token hoặc token không hợp lệ)
- **403**: Forbidden (không có quyền truy cập)
- **404**: Not Found (order/item không tồn tại)
- **500**: Internal Server Error

---

## 🔍 Error Messages

### Validation Errors
- `ID đơn hàng không hợp lệ`
- `ID món ăn không hợp lệ`
- `Số lượng phải là số nguyên >= 1`
- `Loại đơn hàng phải là Dine-in hoặc Takeaway`

### Business Logic Errors
- `Đơn hàng không tồn tại`
- `Bạn không có quyền sửa đơn hàng này`
- `Chỉ có thể thêm món khi đơn hàng ở trạng thái Pending`
- `Món ăn hiện không khả dụng`
- `Món ăn hiện không đủ nguyên liệu`
- `Giỏ hàng trống`
- `Chỉ có thể xóa đơn hàng đã hoàn thành hoặc đã hủy`

---

**Made with ❤️ for SDN302 Project**

