import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import { app } from '../app';
import { PrismaClient } from '@prisma/client';
import nock from 'nock';
import { mockSpoonacularSuccess } from './mocks/spoonacularMock';

const prisma = new PrismaClient();

describe('/api/mealplan', () => {
  const email = 'mealuser@test.de';
  const password = 'test123';
  let cookie: string;

  beforeAll(async () => {
    const user = await prisma.user.findFirst({ where: { email } });
    if (user) {
      await prisma.userProfile.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }

    await request(app).post('/auth/register').send({ email, password });

    const res = await request(app)
      .post('/auth/login')
      .send({ email, password });

    cookie = res.headers['set-cookie'][0];
  });

  afterEach(() => {
    const pending = nock.pendingMocks();
    if (pending.length > 0) {
      const relevant = pending.filter(mock => mock.includes('spoonacular'));
      if (relevant.length > 0) {
        //log nötig um das korrekt mitzuverfolgen aufgrund von unerklärten fehlern
        console.warn('nicht aufgerufene Nock-Mocks:', relevant);
      }
    }
    nock.cleanAll();
  });

  afterAll(async () => {
    const user = await prisma.user.findFirst({ where: { email } });
    if (user) {
      await prisma.userProfile.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  });

  it('liefert einen Mealplan für ein gültiges Profil', async () => {
    mockSpoonacularSuccess();

    const profileRes = await request(app)
      .post('/api/profile')
      .set('Cookie', cookie)
      .send({
        age: 25,
        weight: 75,
        height: 180,
        gender: 'male',
        activity: 'medium',
        goal: 'gainMuscle',
        dietType: 'omnivore',
      });

    expect(profileRes.status).toBe(201);

    const res = await request(app)
      .post('/api/mealplan')
      .set('Cookie', cookie)
      .send({
        mealsPerDay: 3,
        mealDistribution: [0.3, 0.3, 0.4],
        burned: 300,
        dietType: 'omnivore',
      });

    expect(res.status).toBe(200);
    expect(res.body.totalCalories).toBeGreaterThan(0);
    expect(res.body.meals).toBeDefined();
    expect(Object.keys(res.body.meals).length).toBe(3);
  });

  it('verweigert Zugriff ohne Token', async () => {
    const res = await request(app)
      .post('/api/mealplan')
      .send({
        mealsPerDay: 3,
        mealDistribution: [0.3, 0.3, 0.4],
        burned: 300,
        dietType: 'omnivore',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});