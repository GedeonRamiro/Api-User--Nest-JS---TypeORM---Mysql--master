import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import dataSource from '../../typeorm/data-source';
import { Role } from '../../src/enums/role.enum';

describe('Create - User (e2e)', () => {
  let app: INestApplication;
  let accessToken = '';
  let userId: number;

  beforeAll(async () => {
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

    const resultLogin = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'bastos',
        email: 'bastos@hotmail.com',
        password: '123456',
      });

    accessToken = resultLogin.body.accessToken;

    const me = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `bearer ${accessToken}`)
      .send();

    userId = me.body.user.id;

    const ds = await dataSource.initialize();
    const queryRunner = ds.createQueryRunner();
    await queryRunner.query(`
      UPDATE users SET role = ${Role.Admin} WHERE id = ${userId}
      `);
    dataSource.destroy();
  });

  afterAll(() => {
    app.close();
  });

  it('Cadastrar usuário!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `bearer ${accessToken}`)
      .send({
        name: 'create',
        email: 'create@hotmail.com',
        password: '123456',
      });

    expect(resultRegister.statusCode).toEqual(201);
  });

  it('Cadastrar usuário sem token!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'create02',
        email: 'create02@hotmail.com',
        password: '123456',
      });

    expect(resultRegister.statusCode).toEqual(403);
  });

  it('Buscar usuários!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `bearer ${accessToken}`)
      .send();

    expect(resultRegister.statusCode).toEqual(200);
    expect(resultRegister.body).toHaveProperty('data');
  });

  it('Buscar usuários sem token!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .get('/users')
      .send();

    expect(resultRegister.statusCode).toEqual(403);
  });

  it('Buscar usuário pelo ID!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `bearer ${accessToken}`)
      .send();

    expect(resultRegister.statusCode).toEqual(200);
    expect(typeof resultRegister.body.id).toEqual('number');
  });

  it('Buscar usuário pleo ID sem token!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .get('/users/1')
      .send();

    expect(resultRegister.statusCode).toEqual(403);
  });

  it('Atualizar usuário - método PUT!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .patch('/users/1')
      .set('Authorization', `bearer ${accessToken}`)
      .send();

    expect(resultRegister.statusCode).toEqual(200);
    expect(typeof resultRegister.body.id).toEqual('number');
  });

  it('Atualizar usuário - método PUT sem token!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .patch('/users/1')
      .send();

    expect(resultRegister.statusCode).toEqual(403);
  });
  it('Atualizar usuário - método PACTH!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .patch('/users/1')
      .set('Authorization', `bearer ${accessToken}`)
      .send();

    expect(resultRegister.statusCode).toEqual(200);
    expect(typeof resultRegister.body.id).toEqual('number');
  });

  it('Atualizar usuário - método PACTH sem token!', async () => {
    const resultRegister = await request(app.getHttpServer())
      .patch('/users/1')
      .send();

    expect(resultRegister.statusCode).toEqual(403);
  });
});
