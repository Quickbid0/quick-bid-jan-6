import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'

export class TestUtils {
  static async createTestingModule(): Promise<{
    app: INestApplication
    module: TestingModule
  }> {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    const app = module.createNestApplication()
    await app.init()

    return { app, module }
  }

  static async createTestApp(): Promise<INestApplication> {
    const { app } = await this.createTestingModule()
    return app
  }

  static async request(app: INestApplication) {
    return request(app.getHttpServer())
  }
}
