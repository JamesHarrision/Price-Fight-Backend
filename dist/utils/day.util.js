"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = exports.getDate = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const getDate = () => (0, dayjs_1.default)().add(7, 'hour').toDate();
exports.getDate = getDate;
const parseDate = (input) => {
    return (0, dayjs_1.default)(input).add(7, 'hour').toDate();
};
exports.parseDate = parseDate;
