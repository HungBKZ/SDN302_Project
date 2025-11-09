const Table = require('../../models/Table');

exports.createTable = async (req, res) => {
    try {
        const { NumberOfSeats, FloorNumber } = req.body;

        const existingTable = await Table.findOne({ FloorNumber });

        if (existingTable) {
            return res.status(400).json({ message: 'Table with the same FloorNumber already exists' });
        }

        const newTable = new Table({
            NumberOfSeats,
            FloorNumber
        });

        await newTable.save();
        res.status(201).json({ message: 'Table created successfully', table: newTable });

    } catch (error) {
        res.status(500).json({ message: 'Error creating table', error });
    }
}

exports.getTables = async (req, res) => {
    try {
        const tables = await Table.find({ IsDeleted: 0 });
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tables', error });
    }
}

exports.getTableById = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await Table.findById(id);
        if (!table || table.IsDeleted === 1) {
            return res.status(404).json({ message: 'Table not found' });
        }
        res.status(200).json(table);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching table', error });
    }
}

exports.updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        const { NumberOfSeats, FloorNumber, TableStatus, IsDeleted } = req.body;

        const table = await Table.findById(id);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const updateTable = await Table.findByIdAndUpdate(
            id,
            { NumberOfSeats, FloorNumber, TableStatus, IsDeleted },
            { new: true }
        );

        res.status(200).json({ message: 'Table updated successfully', table: updateTable });
    } catch (error) {
        res.status(500).json({ message: 'Error updating table', error });
    }
}

exports.deleteTable = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await Table.findById(id);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const deleteTable = await Table.findOneAndDelete({ _id: id });
        res.status(200).json({ message: 'Table deleted successfully', table: deleteTable });

    } catch (error) {
        res.status(500).json({ message: 'Error deleting table', error });
    }
}
