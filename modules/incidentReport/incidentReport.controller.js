const IncidentReport = require('../../models/IncidentReport');
const { Account } = require('../../models/Account');


exports.getAllIncidentReports = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const account = await Account.findById(userId);

        if (!account || (account.UserRole === 'Manager')) {
            const incidentReports = await IncidentReport.find().populate('ReporterId', 'Name UserRole');

            const incidentReport = incidentReports.map(report => ({
                id: report._id,
                ReportType: report.ReportType,
                Description: report.Description,
                CreatedAt: report.CreatedAt,
                Reporter: report.ReporterId ? {
                    Name: report.ReporterId.Name,
                    UserRole: report.ReporterId.UserRole
                } : null,
            }));

            res.status(200).json({ incidentReport });

        } else {
            res.status(403).json({ message: 'Forbidden: Managers only' });
        }

    } catch (error) {
        console.error('Error fetching incident reports:', error);
        res.status(500).json({ message: 'Error fetching incident reports', error: error.message });
    }
}

exports.createIncidentReport = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const account = await Account.findById(userId);

        if (!account || (account.UserRole !== 'Kitchen staff') && (account.UserRole !== 'Waiter')) {
            return res.status(403).json({ message: 'Forbidden: Kitchen staff and Waiter only' });
        }

        const { ReportType, Description } = req.body;

        if (!ReportType || !Description) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newIncidentReport = new IncidentReport({
            ReporterId: userId,
            ReportType,
            Description
        });

        await newIncidentReport.save();

        res.status(201).json({
            message: 'Incident report created successfully',
            incidentReport: newIncidentReport
        });
    } catch (error) {
        console.error('Error creating incident report:', error);
        res.status(500).json({ message: 'Error creating incident report', error: error.message });
    }
}

exports.updateIncidentReport = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.user?._id;
        const account = await Account.findById(userId);

        if (!account || (account.UserRole !== 'Kitchen staff') && (account.UserRole !== 'Waiter')) {
            return res.status(403).json({ message: 'Forbidden: Kitchen staff and Waiter only' });
        }

        const { ReportType, Description } = req.body;

        if (!ReportType || !Description) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const updateIncidentReport = await IncidentReport.findByIdAndUpdate(
            id,
            { ReportType, Description },
            { new: true }
        );
        res.status(200).json({ message: 'Incident report updated successfully', incidentReport: updateIncidentReport });

    } catch (error) {
        console.error('Error updating incident report:', error);
        res.status(500).json({ message: 'Error updating incident report', error: error.message });
    }
}

exports.updateStatusIncidentReport = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.user?._id;
        const account = await Account.findById(userId);
        const { Status } = req.body;

        if (!Status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (account.UserRole === 'Manager') {

            const updateIncidentReport = await IncidentReport.findByIdAndUpdate(
                id,
                { Status },
                { new: true }
            );
            res.status(200).json({ message: 'Incident report status updated successfully', incidentReport: updateIncidentReport });
        }
        else {
            res.status(403).json({ message: 'Forbidden: Managers only' });
        }

    } catch (error) {
        console.error('Error updating incident report status:', error);
        res.status(500).json({ message: 'Error updating incident report status', error: error.message });
    }
}

exports.deleteIncidentReport = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.user?._id;
        const account = await Account.findById(userId);

        const incidentReport = await IncidentReport.findById(id);

        if (!incidentReport) {
            return res.status(404).json({ message: 'Incident report not found' });
        }

        if (account.UserRole === 'Manager') {

            const deletedIncidentReport = await IncidentReport.findByIdAndDelete(id);
            res.status(200).json({ message: 'Incident report deleted successfully', incidentReport: deletedIncidentReport });
        }
        else {
            res.status(403).json({ message: 'Forbidden: Managers only' });
        }

    } catch (error) {
        console.error('Error deleting incident report:', error);
        res.status(500).json({ message: 'Error deleting incident report', error: error.message });
    }
}