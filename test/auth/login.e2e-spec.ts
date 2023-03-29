import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';

describe('Login - Auth (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'ramiro',
      email: 'ramiro@hotmail.com',
      password: '123456',
    });
  });

  afterEach(() => {
    app.close();
  });

  it('Fazer login', async () => {
    const resultLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'ramiro@hotmail.com',
        password: '123456',
      });

    expect(resultLogin.statusCode).toEqual(201);
    expect(resultLogin.body).toHaveProperty('accessToken');
  });

  it('Entrar sem propriedades', async () => {
    const resultLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({});

    expect(resultLogin.statusCode).toEqual(400);
    expect(resultLogin.body).toHaveProperty('message');
  });

  it('Entrar sem email', async () => {
    const resultLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ password: '123456' });

    expect(resultLogin.statusCode).toEqual(400);
    expect(resultLogin.body).toHaveProperty('message');
  });

  it('Entrar com email inválido!', async () => {
    const resultLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ramirohotmail.com', password: '123456' });

    expect(resultLogin.statusCode).toEqual(400);
    expect(resultLogin.body).toHaveProperty('message');
  });

  it('Entrar com email errado!', async () => {
    const resultLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'rshdjfhdjs@hotmail.com', password: '123456' });

    expect(resultLogin.statusCode).toEqual(401);
    expect(resultLogin.body).toHaveProperty('message');
  });

  it('Entrar sem senha!', async () => {
    const resultLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ramiro@hotmail.com' });

    expect(resultLogin.statusCode).toEqual(400);
    expect(resultLogin.body).toHaveProperty('message');
  });

  it('Entrar com senha muito curta!', async () => {
    const resultLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ramiro@hotmail.com', password: '123' });

    expect(resultLogin.statusCode).toEqual(400);
    expect(resultLogin.body).toHaveProperty('message');
  });

  it('Entrar com senha errada!', async () => {
    const resultLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ramiro@hotmail.com', password: '654321' });

    expect(resultLogin.statusCode).toEqual(401);
    expect(resultLogin.body).toHaveProperty('message');
  });
});
