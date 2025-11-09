const mongoose = require('mongoose');

/**
 * IncidentReport model (Mongoose)
 * JSON mẫu:
 * {
 *   _id: ObjectId("495230303100000000000000"),
 *   ReporterId: ObjectId("575430303100000000000000"),
 *   ReportType: "Equipment",
 *   Description: "Customer spilled water on table TA102",
 *   Status: "Confirmed",
 *   CreatedAt: 2025-11-08T12:45:00.000Z
 * }
 *
 * Ghi chú:
 * - ReporterId tham chiếu tới 'Account' (nhân viên/người báo cáo).
 * - ReportType/Status là String linh hoạt (không dùng enum cứng).
 * - Có IsDeleted (0/1) để hỗ trợ xóa mềm đồng bộ với các model khác.
 */

const incidentReportSchema = new mongoose.Schema(
    {
        ReporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true
        },
        ReportType: {
            type: String,
            required: true,
            trim: true,
            index: true
            // Ví dụ: 'Equipment', 'Safety', 'Cleanliness', 'Service', ...
        },
        Description: {
            type: String,
            required: true,
            trim: true,
            // maxlength: 2000
        },
        Status: {
            type: String,
            required: true,
            trim: true,
            default: 'Pending',
            index: true
            // Ví dụ: 'Pending', 'Confirmed', 'Resolved', 'Cancelled'
        },
        CreatedAt: {
            type: Date,
            default: Date.now
        },
    }
);

// // Các index hỗ trợ truy vấn
// incidentReportSchema.index({ ReporterId: 1, CreatedAt: -1 });
// incidentReportSchema.index({ Status: 1, CreatedAt: -1 });

// /**
//  * Static: tạo báo cáo sự cố
//  */
// incidentReportSchema.statics.createReport = function (payload) {
//     return this.create(payload);
// };

// /**
//  * Static: danh sách theo trạng thái
//  */
// incidentReportSchema.statics.listByStatus = function (status, limit = 100) {
//     return this.find({ Status: status, IsDeleted: 0 })
//         .sort({ CreatedAt: -1 })
//         .limit(limit);
// };

// /**
//  * Static: danh sách theo người báo cáo
//  */
// incidentReportSchema.statics.listByReporter = function (reporterId, limit = 100) {
//     return this.find({ ReporterId: reporterId, IsDeleted: 0 })
//         .sort({ CreatedAt: -1 })
//         .limit(limit);
// };

// /**
//  * Instance: cập nhật trạng thái
//  */
// incidentReportSchema.methods.updateStatus = async function (nextStatus) {
//     this.Status = nextStatus;
//     await this.save();
//     return this;
// };

// /**
//  * Instance: xóa mềm
//  */
// incidentReportSchema.methods.softDelete = async function () {
//     if (this.IsDeleted === 0) {
//         this.IsDeleted = 1;
//         await this.save();
//     }
//     return this;
// };

// /**
//  * Middleware: cập nhật UpdatedAt trước khi save
//  */
// incidentReportSchema.pre('save', function (next) {
//     this.UpdatedAt = new Date();
//     next();
// });

const IncidentReport = mongoose.model('IncidentReport', incidentReportSchema, 'incident_reports');

module.exports = IncidentReport;