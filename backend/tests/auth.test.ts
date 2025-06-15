import request from 'supertest';
import express from 'express';
import authRouter from '../route/authRoute';
import { User } from '../model/User';


const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Integrationstest für register und login..', () => {
  it('user registrieren', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@test.de',
        password: 'test123',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('test@test.de');
  });

  it('keine doppelte Registrierung', async () => {
    //Erste Registrierung
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test2@test.de',
        password: 'test123',
      });

    //Gleiche Registrierung nochmal
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test2@test.de',
        password: 'test123',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('erfolgreicher login', async () => {
    const email = 'login@test.de';
    const password = 'test123';
  
    // Vorher registrieren
    await request(app)
      .post('/api/auth/register')
      .send({ email, password });
  
    // Dann einloggen
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
  
    expect(response.status).toBe(200);
   // expect(response.body).toBe('{"message": "AuthControllerInfo: login succesfull"}');
  });

  it('falsches passwort für login', async () => {
    const email = 'test@test.de';
    const password = 'test123';
  
    await request(app)
      .post('/api/auth/register')
      .send({ email, password });
  
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'test123123' });
  
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('email existiert nicht', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testtesttest@test.de', password: '123456' });
  
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('body leer bei login request', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});
  
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
  
  it('email ungültig', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid', password: 'short' });
  
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
  it('Passwort zu krz', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.de', password: '123' });
  
    expect(response.status).toBe(400);
  });
    
});
