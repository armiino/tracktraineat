import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { cleanupTestUser } from '../utils/cleanup';

import { createUserProfileRoute } from '../../../backend/route/userProfileRoute';
import calculateProfileRoute from '../../../backend/route/calculateProfileRoute';
import authRoute from '../../../backend/route/authRoute';
import { PostgresUserProfileAdapter } from '../../../backend/adapter/PostgresUserProfileAdapter';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoute);
app.use('/api', calculateProfileRoute);
app.use('/api', createUserProfileRoute());

const adapter = new PostgresUserProfileAdapter();
const email = 'test-calc@example.com';
const password = 'securePassword123';

let cookie = '';
let userId = ''; //soll aus dem jwt extrahiert werden

describe('CalculateProfileController: Integration', () => {
  const validProfile = {
    age: 30,
    height: 180,
    weight: 80,
    gender: 'male',
    activity: 'medium',
    goal: 'gainMuscle',
    dietType: 'omnivore'
  };

  beforeAll(async () => {
    await request(app).post('/auth/register').send({ email, password });

    // login und dann token extrahieren
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email, password });

    cookie = loginRes.headers['set-cookie'][0];

    const token = cookie.split('=')[1].split(';')[0];
    const decoded: any = jwt.decode(token);

    userId = decoded?.id;
    if (!userId) throw new Error('konnte userId nicht aus Token lesen');
  });

  beforeEach(async () => {
    await adapter.deleteByUserId(userId);
  });

  afterEach(async () => {
    await adapter.deleteByUserId(userId);
  });

  it('berechnet erfolgreich die Kalorien basierend auf dem gespeicherten Profil', async () => {
    const createRes = await request(app)
      .post('/api/profile')
      .set('Cookie', cookie)
      .send(validProfile);

    if (createRes.status !== 201) {
      console.error('Profil konnte nicht erstellt werden:', createRes.body);
    }

    expect(createRes.status).toBe(201);

    const res = await request(app)
      .get('/api/calculate/from-profile')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('bmr');
    expect(res.body).toHaveProperty('tdee');
    expect(typeof res.body.bmr).toBe('number');
    expect(typeof res.body.tdee).toBe('number');
  });

  it('gibt 404 zurück, wenn kein Profil vorhanden ist', async () => {
    const res = await request(app)
      .get('/api/calculate/from-profile')
      .set('Cookie', cookie);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
  
  afterAll(async () => {
    await cleanupTestUser(email);
  });
});
