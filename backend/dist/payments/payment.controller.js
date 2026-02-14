"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("./payment.service");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createOrder(body) {
        try {
            const order = await this.paymentService.createOrder(body);
            return {
                success: true,
                order,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Failed to create order',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyPayment(body) {
        try {
            const isVerified = await this.paymentService.verifyPayment(body);
            if (!isVerified) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Payment verification failed',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            return {
                success: true,
                verified: true,
                message: 'Payment verified successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Payment verification failed',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async processAuctionPayment(body, req) {
        try {
            const isVerified = await this.paymentService.verifyPayment({
                paymentId: body.paymentId,
                orderId: body.orderId,
                signature: body.signature,
            });
            if (!isVerified) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Payment verification failed',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.paymentService.processAuctionPayment({
                auctionId: body.auctionId,
                amount: body.amount,
                paymentId: body.paymentId,
                orderId: body.orderId,
                userId: body.userId,
                sellerId: body.sellerId,
            });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Payment processing failed',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async processRefund(body) {
        try {
            const result = await this.paymentService.processRefund(body);
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Refund processing failed',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPayment(paymentId) {
        try {
            const payment = await this.paymentService.getPayment(paymentId);
            return {
                success: true,
                payment,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch payment details',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getOrder(orderId) {
        try {
            const order = await this.paymentService.getOrder(orderId);
            return {
                success: true,
                order,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch order details',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleWebhook(webhookData, req) {
        try {
            const signature = req.headers['x-razorpay-signature'];
            if (!signature) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Missing webhook signature',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const isValid = await this.paymentService.handleWebhook(webhookData, signature);
            if (!isValid) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Invalid webhook signature',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            return {
                success: true,
                message: 'Webhook processed successfully',
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Webhook processing failed',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('create-order'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Razorpay order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Razorpay payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment verified' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('auction-payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Process auction payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment processed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "processAuctionPayment", null);
__decorate([
    (0, common_1.Post)('refund'),
    (0, swagger_1.ApiOperation)({ summary: 'Process refund' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund processed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "processRefund", null);
__decorate([
    (0, common_1.Get)('payment/:paymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment details retrieved' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPayment", null);
__decorate([
    (0, common_1.Get)('order/:orderId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order details retrieved' }),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Razorpay webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleWebhook", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map