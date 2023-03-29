import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';

describe('Create - Auth (e2e)', () => {
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
  });

  afterEach(() => {
    app.close();
  });

  it('Cadastrar usuário!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'gedeon',
        email: 'gedeon@hotmail.com',
        password: '123456',
      });

    expect(resultRegister.statusCode).toEqual(201);
    expect(resultRegister.body).toHaveProperty('accessToken');
  });

  it('Cadastrar usuário com email duplicado!', async () => {
    const resultRegister01 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'ramiro duplicado',
        email: 'ramiroduplicado@hotmail.com',
        password: '123456',
      });

    expect(resultRegister01.statusCode).toEqual(201);
    expect(resultRegister01.body).toHaveProperty('accessToken');

    const resultRegister02 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'ramiro duplicado',
        email: 'ramiroduplicado@hotmail.com',
        password: '123456',
      });

    expect(resultRegister02.statusCode).toEqual(502);
    expect(resultRegister02.body).toHaveProperty('message');
  });

  it('Cadastrar usuário sem propriedades!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({});

    expect(resultRegister.statusCode).toEqual(400);
    expect(resultRegister.body).toHaveProperty('message');
  });

  it('Cadastrar usuário com nome muito curto!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'gd',
        email: 'gedeon@hotmail.com',
        password: '123456',
      });

    expect(resultRegister.statusCode).toEqual(400);
    expect(resultRegister.body).toHaveProperty('message');
  });

  it('Cadastrar usuário sem nome!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'gedeon@hotmail.com',
        password: '123456',
      });

    expect(resultRegister.statusCode).toEqual(400);
    expect(resultRegister.body).toHaveProperty('message');
  });

  it('Cadastrar usuário com email inválido!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'gedeon',
        email: 'gedeonhotmail.com',
        password: '123456',
      });

    expect(resultRegister.statusCode).toEqual(400);
    expect(resultRegister.body).toHaveProperty('message');
  });

  it('Cadastrar usuário sem email!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'gedeon',
        password: '123456',
      });

    expect(resultRegister.statusCode).toEqual(400);
    expect(resultRegister.body).toHaveProperty('message');
  });

  it('Cadastrar usuário com senha muito curta!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'gedeon',
        email: 'gedeonhotmail.com',
        password: '123',
      });

    expect(resultRegister.statusCode).toEqual(400);
    expect(resultRegister.body).toHaveProperty('message');
  });

  it('Cadastrar usuário com sem senha!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'gedeon',
        email: 'gedeonhotmail.com',
      });

    expect(resultRegister.statusCode).toEqual(400);
    expect(resultRegister.body).toHaveProperty('message');
  });
});
