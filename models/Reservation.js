const mongoose = require('mongoose');

/**
 * Reservation model (Mongoose)
 * JSON mẫu:
 * {
 *   _id: ObjectId("525330303800000000000000"),
 *   TableId: ObjectId("544131303800000000000000"),
 *   CustomerId: null | ObjectId,
 *   UserId: ObjectId("555330303100000000000000"),   // nhân viên tạo hoặc xác nhận
 *   ReservationTime: 2025-11-13T19:00:00.000Z,
 *   NumberOfGuests: 4,
 *   Status: "Confirmed"
 * }
 *
 * Ghi chú thiết kế:
 * - ReservationTime: thời điểm khách đến (UTC). Có thể bổ sung EndTime nếu cần khoảng thời gian.
 * - Status: linh hoạt (Pending, Confirmed, Seated, Completed, Cancelled, No-show, ...). Không dùng enum cứng.
 * - CustomerId: có thể null (khách vãng lai). Nếu có hệ thống Customer riêng thì ref 'Customer'.
 * - UserId: nhân viên phụ trách (ref 'Account'), có thể null nếu khách tự đặt qua hệ thống online.
 * - Thêm IsDeleted để hỗ trợ xóa mềm nếu cần sau này.
 */

const reservationSchema = new mongoose.Schema(
    {
        TableId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            required: true,
            index: true
        },
        CustomerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            default: null,
            index: true
        },
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            default: null,
            index: true
        },
        ReservationTime: {
            type: Date,
            required: true,
            index: true,
            validate: {
                validator: (v) => v instanceof Date && v.getTime() > Date.now(),
                message: 'ReservationTime phải ở tương lai'
            }
        },
        NumberOfGuests: {
            type: Number,
            required: true,
            min: [1, 'NumberOfGuests phải >= 1'],
            validate: {
                validator: Number.isInteger,
                message: 'NumberOfGuests phải là số nguyên'
            }
        },
        Status: {
            type: String,
            required: true,
            trim: true,
            default: 'Pending',
            index: true
        },
        CreatedAt: {
            type: Date,
            default: Date.now
        }
    }
);

// /**
//  * Index bổ sung:
//  * - Tìm đặt bàn theo thời gian và trạng thái chưa xóa.
//  */
// reservationSchema.index({ ReservationTime: 1, Status: 1, IsDeleted: 1 });
// reservationSchema.index({ TableId: 1, ReservationTime: 1 });

// /**
//  * Virtual: YearMonthDay (phục vụ grouping lịch)
//  */
// reservationSchema.virtual('DateKey').get(function () {
//     if (!this.ReservationTime) return null;
//     const d = new Date(this.ReservationTime);
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
//         d.getDate()
//     ).padStart(2, '0')}`;
// });

// /**
//  * Middleware: cập nhật UpdatedAt trước khi save
//  */
// reservationSchema.pre('save', function (next) {
//     this.UpdatedAt = new Date();
//     next();
// });

// /**
//  * Static: tạo mới reservation (có check trùng đơn giản theo cùng TableId & thời điểm)
//  * Lưu ý: Đây là check chính xác thời điểm; nếu bạn muốn khoảng thời gian, cần thêm Start/EndTime.
//  */
// reservationSchema.statics.createReservation = async function (payload) {
//     // Kiểm tra trùng exact time cho cùng Table nếu chưa xóa & chưa Cancelled
//     const existing = await this.findOne({
//         TableId: payload.TableId,
//         ReservationTime: payload.ReservationTime,
//         IsDeleted: 0,
//         Status: { $nin: ['Cancelled'] }
//     });
//     if (existing) {
//         throw new Error('Đã có reservation cho bàn này tại thời điểm đó');
//     }
//     return this.create(payload);
// };

// /**
//  * Static: danh sách reservation theo ngày (UTC) cho một Table (optional)
//  */
// reservationSchema.statics.listByDate = function ({ date, tableId = null }) {
//     // date: Date (chiếu theo ngày UTC)
//     const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
//     const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
//     const match = {
//         ReservationTime: { $gte: start, $lte: end },
//         IsDeleted: 0
//     };
//     if (tableId) match.TableId = tableId;
//     return this.find(match).sort({ ReservationTime: 1 });
// };

// /**
//  * Static: lấy upcoming reservations (trong tương lai) giới hạn
//  */
// reservationSchema.statics.upcoming = function (limit = 50) {
//     return this.find({
//         ReservationTime: { $gte: new Date() },
//         IsDeleted: 0,
//         Status: { $in: ['Pending', 'Confirmed'] }
//     })
//         .sort({ ReservationTime: 1 })
//         .limit(limit);
// };

// /**
//  * Instance: cập nhật trạng thái
//  */
// reservationSchema.methods.updateStatus = async function (nextStatus) {
//     this.Status = nextStatus;
//     await this.save();
//     return this;
// };

// /**
//  * Instance: soft delete
//  */
// reservationSchema.methods.softDelete = async function () {
//     if (this.IsDeleted === 0) {
//         this.IsDeleted = 1;
//         await this.save();
//     }
//     return this;
// };

const Reservation = mongoose.model('Reservation', reservationSchema, 'reservations');

module.exports = Reservation;