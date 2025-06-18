import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

import { AuthController } from '../../controller/authController';
import { PostgresUserAdapter } from '../../adapter/PostgresUserAdapter';
import { authService } from '../../service/authService';

const userRepo = new PostgresUserAdapter();
const service = authService(userRepo);
const controller = new AuthController(service);

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post('/api/auth/register', controller.register.bind(controller));
app.post('/api/auth/login', controller.login.bind(controller));

describe('AuthController: Integration', () => {
  const email = 'test@example.com';
  const password = 'securePass123';

  //sicherheitshalber aufräumen bevors losgeht
  beforeEach(async () => {
    await userRepo.deleteByEmail(email);
  });

  afterEach(async () => {
    await userRepo.deleteByEmail(email);
  });

  it('erlaubt korrekte Registrierung', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(email);
    expect(res.body).toHaveProperty('id');
    expect(res.body.role).toBe('user');
  });

  it('verhindert doppelte Registrierung', async () => {
    await request(app).post('/api/auth/register').send({ email, password });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('erlaubt erfolgreichen Login und setzt Cookie', async () => {
    await request(app).post('/api/auth/register').send({ email, password });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('login succesfull');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('token=');
      
  });

  it('lehnt Login mit falschem Passwort ab', async () => {
    await request(app).post('/api/auth/register').send({ email, password });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrongPass' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('lehnt Login mit leerem Body ab', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('validiert ungültige E-Mail beim Registrieren', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid', password: '12345678' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('validiert zu kurzes Passwort', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password: '123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('lehnt Login mit nicht existierender Email ab', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password });
  
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
  
});
