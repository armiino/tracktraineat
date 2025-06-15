import request from 'supertest';
import app from '../index'; // Passe das ggf. an, falls du dein Express-App anders exportierst

describe('🍽️ /api/mealplan', () => {
  let cookie: string;

  const email = 'mealuser@test.de';
  const password = 'test123';

  beforeAll(async () => {
    // 1. Registrieren
    await request(app)
      .post('/auth/register')
      .send({ email, password });

    // 2. Login (Cookie speichern)
    const res = await request(app)
      .post('/auth/login')
      .send({ email, password });

    cookie = res.headers['set-cookie'][0];
  });

  it('✅ liefert einen Mealplan für ein gültiges Profil', async () => {
    // 3. Profil anlegen
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

    // 4. Mealplan anfordern
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

  it('❌ verweigert Zugriff ohne Token', async () => {
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
