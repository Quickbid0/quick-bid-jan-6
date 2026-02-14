"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../app.module");
describe('QuickBid E2E Tests', () => {
    let app;
    let server;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        server = app.getHttpServer();
    });
    afterAll(async () => {
        await app.close();
    });
    describe('Health Check', () => {
        it('should return health status', () => {
            return request(server)
                .get('/health')
                .expect(200)
                .expect((res) => {
                expect(res.body.status).toBe('ok');
            });
        });
    });
    describe('Database Connection', () => {
        it('should connect to database', () => {
            return request(server)
                .get('/test-db')
                .expect(200)
                .expect((res) => {
                expect(res.body.status).toBe('connected');
            });
        });
    });
    describe('Rate Limiting', () => {
        it('should apply rate limiting to API endpoints', async () => {
            const promises = Array(10).fill(null).map(() => request(server)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password' }));
            const responses = await Promise.all(promises);
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });
    });
    describe('Security Headers', () => {
        it('should include security headers', () => {
            return request(server)
                .get('/health')
                .expect(200)
                .expect((res) => {
                expect(res.headers['x-content-type-options']).toBe('nosniff');
                expect(res.headers['x-frame-options']).toBe('DENY');
                expect(res.headers['x-xss-protection']).toBe('1; mode=block');
            });
        });
    });
    describe('Performance Headers', () => {
        it('should include performance headers', () => {
            return request(server)
                .get('/health')
                .expect(200)
                .expect((res) => {
                expect(res.headers['x-response-time']).toBeDefined();
                expect(res.headers['x-request-id']).toBeDefined();
            });
        });
    });
    describe('CORS Configuration', () => {
        it('should handle CORS preflight requests', () => {
            return request(server)
                .options('/api/health')
                .set('Origin', 'https://quickbid.com')
                .expect(200)
                .expect((res) => {
                expect(res.headers['access-control-allow-origin']).toBe('https://quickbid.com');
                expect(res.headers['access-control-allow-credentials']).toBe('true');
            });
        });
    });
    describe('API Endpoints', () => {
        it('should handle 404 for non-existent routes', () => {
            return request(server)
                .get('/api/non-existent')
                .expect(404);
        });
        it('should handle malformed requests gracefully', () => {
            return request(server)
                .post('/api/auth/login')
                .send({ invalid: 'data' })
                .expect(400);
        });
    });
    describe('Input Validation', () => {
        it('should reject invalid email addresses', () => {
            return request(server)
                .post('/api/auth/register')
                .send({ email: 'invalid-email', password: 'password123' })
                .expect(400);
        });
        it('should reject weak passwords', () => {
            return request(server)
                .post('/api/auth/register')
                .send({ email: 'test@example.com', password: '123' })
                .expect(400);
        });
    });
    describe('Error Handling', () => {
        it('should handle server errors gracefully', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });
            const response = await request(server)
                .get('/api/test-error')
                .expect(500);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('Concurrent Requests', () => {
        it('should handle concurrent requests', async () => {
            const concurrentRequests = Array(50).fill(null).map(() => request(server).get('/health'));
            const responses = await Promise.all(concurrentRequests);
            responses.forEach(res => {
                expect(res.status).toBe(200);
            });
        });
    });
    describe('Memory Usage', () => {
        it('should not leak memory during multiple requests', async () => {
            const initialMemory = process.memoryUsage();
            for (let i = 0; i < 100; i++) {
                await request(server).get('/health');
            }
            if (global.gc) {
                global.gc();
            }
            const finalMemory = process.memoryUsage();
            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        });
    });
});
//# sourceMappingURL=e2e.test.js.map