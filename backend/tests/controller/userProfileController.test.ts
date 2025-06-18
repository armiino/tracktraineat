import request from 'supertest';
import express from 'express';
import { UserProfileController } from '../../controller/UserProfileController';
import { userProfileService } from '../../service/userProfileService';
import { PostgresUserProfileAdapter } from '../../adapter/PostgresUserProfileAdapter';

const adapter = new PostgresUserProfileAdapter();
const service = userProfileService(adapter);
const controller = new UserProfileController(service);

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  (req as any).user = { id: 'test-user-id2' };
  next();
});

app.post('/api/profile', controller.createProfile.bind(controller));
app.get('/api/profile', controller.getProfile.bind(controller));
app.put('/api/profile', controller.updateProfile.bind(controller));

const validProfile = {
  age: 28,
  height: 180,
  weight: 75,
  gender: 'male',
  activity: 'medium',
  goal: 'gainMuscle',
  dietType: 'omnivore',
};

describe('UserProfileController: Integration', () => {
  beforeEach(async () => {
    await adapter.deleteByUserId('test-user-id2');
  });

  afterEach(async () => {
    await adapter.deleteByUserId('test-user-id2');
  });

  it('erstellt erfolgreich ein Profil', async () => {
    const res = await request(app)
      .post('/api/profile')
      .send(validProfile);

    if (res.status !== 201) {
      console.error('Profil konnte nicht erstellt werden:', res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.age).toBe(validProfile.age);
  });

  it('liest ein bestehendes Profil korrekt aus', async () => {
    await request(app).post('/api/profile').send(validProfile);

    const res = await request(app).get('/api/profile');

    if (res.status !== 200) {
      console.error('Konnte Profil nicht lesen:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.height).toBe(validProfile.height);
  });

  it('aktualisiert erfolgreich das Profil', async () => {
    await request(app).post('/api/profile').send(validProfile);

    const updated = {
      age: 30,
      height: 185,
      weight: 80,
      gender: 'male',
      activity: 'high',
      goal: 'loseWeight',
      dietType: 'vegan',
    };

    const res = await request(app).put('/api/profile').send(updated);

    if (res.status !== 200) {
      console.error('Update fehlgeschlagen:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.age).toBe(updated.age);
    expect(res.body.dietType).toBe(updated.dietType);
  });

  it('gibt 400er bei ungültigen Eingaben zurück', async () => {
    const invalid = {
      age: -1,
      height: 0,
      weight: 9999,
      gender: 'invalid',
      activity: 'x',
      goal: 'y',
      dietType: 'unknown',
    };

    const res = await request(app).post('/api/profile').send(invalid);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(Array.isArray(res.body.details)).toBe(true);
  });
});
