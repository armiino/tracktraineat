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
 
  (req as any).user = { id: 'test-user-id3' };
  next();
});

app.post('/api/profile', controller.createProfile.bind(controller));
app.put('/api/profile', controller.updateProfile.bind(controller));

describe('updateProfile', () => {
  const testProfile = {
    age: 25,
    height: 180,
    weight: 75,
    gender: 'male',
    activity: 'medium',
    goal: 'gainMuscle',
    dietType: 'omnivore',
  };

  beforeEach(async () => {
    await adapter.deleteByUserId('test-user-id3');

    const res = await request(app).post('/api/profile').send(testProfile);

    if (res.status !== 201) {
      console.error('Fehler beim Anlegen des Testprofils:', res.body);
      throw new Error('Profil konnte nicht angelegt werden');
    }
  });

  afterEach(async () => {
    await adapter.deleteByUserId('test-user-id3');
  });

  it('aktualisiert erfolgreich das Profil', async () => {
    const res = await request(app).put('/api/profile').send({
      age: 30,
      height: 185,
      weight: 80,
      gender: 'male',
      activity: 'high',
      goal: 'loseWeight',
      dietType: 'vegan',
    });

    expect(res.status).toBe(200);
    expect(res.body.age).toBe(30);
    expect(res.body.height).toBe(185);
    expect(res.body.weight).toBe(80);
    expect(res.body.dietType).toBe('vegan');
  });

  it('gibt 400er bei ungültigen Werten zurück', async () => {
    const res = await request(app).put('/api/profile').send({
      age: -1,
      height: 0,
      weight: 9999,
      gender: 'invalid',
      activity: 'x',
      goal: 'y',
      dietType: 'unknown',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.details).toBeDefined();
  });
});
