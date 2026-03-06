"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const categories_1 = __importDefault(require("./routes/categories"));
const products_1 = __importDefault(require("./routes/products"));
const approvals_1 = __importDefault(require("./routes/approvals"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:8000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/products', products_1.default);
app.use('/api/approvals', approvals_1.default);
app.use('/api/users', users_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        code: 200,
        data: { status: 'ok', timestamp: new Date().toISOString() },
        msg: '服务正常'
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map