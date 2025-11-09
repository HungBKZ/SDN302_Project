# 🔧 Hướng dẫn sửa lỗi "Route not found" cho Order API

## Vấn đề
Khi gọi `POST /api/order`, server trả về lỗi "Route not found".

## Nguyên nhân
Thứ tự routes trong Express Router rất quan trọng. Routes cụ thể (như `/from-cart`, `/history`) phải được đặt TRƯỚC các routes có parameters (như `/:orderId/menu`).

## Giải pháp
Đã sửa lại thứ tự routes trong `modules/order/order.router.js`:

### Thứ tự đúng:
1. ✅ `POST /from-cart` - Route cụ thể
2. ✅ `GET /history` - Route cụ thể  
3. ✅ `GET /new` - Route cụ thể
4. ✅ `POST /` - Route cụ thể (tạo order)
5. ✅ `GET /:orderId/menu` - Route có parameter
6. ✅ Các routes có parameter khác...

## Các bước kiểm tra

### 1. Restart Server
**QUAN TRỌNG**: Sau khi sửa routes, bạn PHẢI restart server:

```bash
# Dừng server (Ctrl + C)
# Sau đó chạy lại
npm start
```

### 2. Kiểm tra Server đã load routes
Sau khi restart, kiểm tra console log xem có lỗi nào không.

### 3. Test API
Sử dụng Postman hoặc cURL để test:

```bash
POST http://127.0.0.1:1234/api/order
Content-Type: application/json

{
  "OrderType": "Dine-in",
  "items": [
    {
      "dishId": "443030390000000000000000",
      "quantity": 2
    }
  ]
}
```

## Nếu vẫn còn lỗi

### Kiểm tra routes đã được đăng ký
Xem file `loaders/routes.js` đảm bảo có dòng:
```javascript
app.use('/api/order', orderRouter);
```

### Kiểm tra middleware
Đảm bảo `optionalAuth` middleware hoạt động đúng:
- File: `core/middlewares/optionalAuth.js`
- Nếu không có token, `req.user` sẽ là `null` (không throw error)

### Kiểm tra validation
Nếu có lỗi validation, sẽ trả về status 400 với message "Dữ liệu không hợp lệ".

### Debug routes
Thêm logging để debug:
```javascript
router.post('/', (req, res, next) => {
    console.log('POST /api/order called');
    next();
}, optionalAuth, validateCreateOrder, orderController.createOrder);
```

## Lưu ý
- Routes cụ thể LUÔN đặt trước routes có parameters
- Server PHẢI restart sau khi thay đổi routes
- Kiểm tra console log để xem có lỗi khi load module không

