const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    TableStatus: {
        type: String,
        enum: ['Available', 'Occupied', 'Reserved', 'Unavailable'],
        default: 'Available',
    },
    NumberOfSeats: {
        type: Number,
        required: [true, 'NumberOfSeats is required'],
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: 'NumberOfSeats must be an integer'
        }
    },
    FloorNumber: {
        type: Number,
        required: [true, 'FloorNumber is required'],
        validate: {
            validator: Number.isInteger,
            message: 'FloorNumber must be an integer'
        }
    },
    IsDeleted: {
        type: Number,
        default: 0, // 0 = chưa xóa, 1 = đã xóa
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Table', tableSchema, 'tables');
