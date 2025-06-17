import dotenv from 'dotenv';
dotenv.config(); // .env muss man laden bevor Prisma verwendet wird

import request from 'supertest';
import express from 'express';
import authRoute from '../route/authRoute';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoute);

describe('Auth Integrationstest-Register & Login', () => {
  const email = 'testuser@example.com';
  const password = 'securePassword123';

  beforeAll(async () => {
    // Testdaten aus der DB löschen
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('registriert einen neuen User', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(email);
  });

  it('verhindert doppelte Registrierung', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('erlaubt erfolgreichen Login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('lehnt falsches Passwort ab', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('lehnt Login mit nicht existierender Email ab', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noone@nowhere.de', password });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('lehnt Login mit leerem Body ab', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('lehnt Registrierung mit ungültiger Email ab', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid', password: '12345678' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('lehnt Registrierung mit zu kurzem Passwort ab', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'kurz@test.de', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
