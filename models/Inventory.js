const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
    {
        ItemName: {
            type: String,
            required: true,
            trim: true
        },
        ItemType: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
            // Không dùng enum nữa. Nếu cần validate mềm có thể thêm custom validator:
            // validate: {
            //   validator: v => ['food','drink','spice','ingredient','other'].includes(v),
            //   message: 'ItemType không hợp lệ'
            // }
        },
        ItemPrice: {
            type: Number,
            required: true,
            // min: [0, 'ItemPrice phải >= 0']
        },
        ItemQuantity: {
            type: Number,
            required: true,
            // min: [0, 'ItemQuantity phải >= 0']
        },
        ItemUnit: {
            type: String,
            required: true,
            trim: true
        },
        ItemDescription: {
            type: String,
            trim: true,
            // default: ''
        },
        IsDeleted: {
            type: Number, // Giữ 0/1 theo dữ liệu gốc
            default: 0,
            // index: true,
            // validate: {
            //     validator: (v) => v === 0 || v === 1,
            //     message: 'IsDeleted chỉ nhận 0 hoặc 1'
            // }
        },
        CreatedAt: {
            type: Date,
            default: Date.now
        },
        UpdatedAt: {
            type: Date,
            default: Date.now
        }
    }
);

// // Index kết hợp tìm kiếm nhanh theo tên + loại + trạng thái
// inventorySchema.index({ ItemName: 1, ItemType: 1, IsDeleted: 1 });

// // Virtual: tổng giá trị tồn kho
// inventorySchema.virtual('TotalValue').get(function () {
//     if (typeof this.ItemPrice === 'number' && typeof this.ItemQuantity === 'number') {
//         return this.ItemPrice * this.ItemQuantity;
//     }
//     return undefined;
// });

// // Middleware cập nhật UpdatedAt
// inventorySchema.pre('save', function (next) {
//     this.UpdatedAt = new Date();
//     next();
// });

// // Static: tìm item hoạt động theo tên
// inventorySchema.statics.findActiveByName = function (name) {
//     return this.findOne({ ItemName: name, IsDeleted: 0 });
// };

// // Instance: xóa mềm
// inventorySchema.methods.softDelete = async function () {
//     this.IsDeleted = 1;
//     await this.save();
//     return this;
// };

const Inventory = mongoose.model('Inventory', inventorySchema, 'inventories');

module.exports = Inventory;