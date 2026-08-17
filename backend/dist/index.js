"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const auth_1 = __importDefault(require("./routes/auth"));
const students_1 = __importDefault(require("./routes/students"));
const payments_1 = __importDefault(require("./routes/payments"));
const receipts_1 = __importDefault(require("./routes/receipts"));
const audit_1 = __importDefault(require("./routes/audit"));
const packages_1 = __importDefault(require("./routes/packages"));
const reports_1 = __importDefault(require("./routes/reports"));
const finances_1 = __importDefault(require("./routes/finances"));
const endOfDay_1 = __importDefault(require("./routes/endOfDay"));
const leads_1 = __importDefault(require("./routes/leads"));
const lessons_1 = __importDefault(require("./routes/lessons"));
const instructors_1 = __importDefault(require("./routes/instructors"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const checkin_1 = __importDefault(require("./routes/checkin"));
const users_1 = __importDefault(require("./routes/users"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const scheduling_1 = __importDefault(require("./routes/scheduling"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const registrations_1 = __importDefault(require("./routes/registrations"));
const ApiError_1 = require("./utils/ApiError");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.get('/api/health/db', async (req, res) => {
    try {
        await db_1.pool.query('SELECT 1');
        res.json({ status: 'ok' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/students', students_1.default);
app.use('/api/v1/payments', payments_1.default);
app.use('/api/v1/receipts', receipts_1.default);
app.use('/api/v1/audit', audit_1.default);
app.use('/api/v1/packages', packages_1.default);
app.use('/api/v1/reports', reports_1.default);
app.use('/api/v1/finances', finances_1.default);
app.use('/api/v1/end-of-day', endOfDay_1.default);
app.use('/api/v1/leads', leads_1.default);
app.use('/api/v1/lessons', lessons_1.default);
app.use('/api/v1/instructors', instructors_1.default);
app.use('/api/v1/attendance', attendance_1.default);
app.use('/api/v1/checkin', checkin_1.default);
app.use('/api/v1/users', users_1.default);
app.use('/api/v1/expenses', expenses_1.default);
app.use('/api/v1/dashboard', dashboard_1.default);
app.use('/api/v1/scheduling', scheduling_1.default);
app.use('/api/v1/uploads', uploads_1.default);
app.use('/api/v1/registrations', registrations_1.default);
app.use((req, res) => {
    res.status(404).json({ error: true, message: 'Not found.', code: 'NOT_FOUND' });
});
app.use((err, req, res, next) => {
    if (err instanceof ApiError_1.ApiError) {
        return res.status(err.status).json({ error: true, message: err.message, code: err.code });
    }
    console.error(err);
    res.status(500).json({ error: true, message: 'Internal server error.', code: 'INTERNAL_ERROR' });
});
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});
//# sourceMappingURL=index.js.map