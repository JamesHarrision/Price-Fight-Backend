"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const transaction_service_1 = require("../services/transaction.service");
class TransactionController {
    constructor() {
        this.transactionService = new transaction_service_1.TransactionService();
        this.getUserTransactions = async (req, res) => {
            const userId = req.user.id;
            const transactions = await this.transactionService.getUserTransactions(userId);
            res.status(200).json({
                message: 'Lấy lịch sử giao dịch thành công!',
                data: transactions,
            });
        };
        this.payTransaction = async (req, res) => {
            const { transactionId } = req.params;
            const userId = req.user.id;
            const result = await this.transactionService.payTransaction(transactionId, userId);
            return res.status(200).json({
                message: 'Thanh toán thành công!',
                data: result,
            });
        };
    }
}
exports.TransactionController = TransactionController;
