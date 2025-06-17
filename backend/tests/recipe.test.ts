import dotenv from 'dotenv';
dotenv.config(); // Muss GANZ oben stehen, damit Prisma auf DATABASE_URL zugreifen kann

import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('/api/mealplan', () => {
  let cookie: string;
  const email = 'mealuser@test.de';
  const password = 'test123';

  beforeAll(async () => {
    // Datenbank vorbereiten,zuerst alles löschen
    await prisma.userProfile.deleteMany({});
    await prisma.user.deleteMany({});

    // Registrierung
    await request(app)
      .post('/auth/register')
      .send({ email, password });

    // Login und Cookie speichern
    const res = await request(app)
      .post('/auth/login')
      .send({ email, password });

    cookie = res.headers['set-cookie'][0];
  });

  afterAll(async () => {
    // Verbindung schließen, damit Jest korrekt beendet (fehler verhindern)
    await prisma.$disconnect();
  });

  it('liefert einen Mealplan für ein gültiges Profil', async () => {
    // Profil anlegen
    await request(app)
      .post('/api/profile')
      .set('Cookie', cookie)
      .send({
        age: 25,
        weight: 75,
        height: 180,
        gender: 'male',
        activity: 'medium',
        goal: 'gainMuscle',
        dietType: 'omnivore'
      });

    // Mealplan abrufen
    const res = await request(app)
      .post('/api/mealplan')
      .set('Cookie', cookie)
      .send({
        mealsPerDay: 3,
        mealDistribution: [0.3, 0.3, 0.4],
        burned: 300,
        dietType: 'omnivore'
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
        dietType: 'omnivore'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});
