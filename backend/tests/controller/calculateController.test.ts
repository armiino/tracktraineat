import request from 'supertest';
import express from 'express';
import { handleCalculate } from '../../../backend/controller/calculateController';

const app = express();
app.use(express.json());
app.post('/api/calculate', handleCalculate);

describe('CalculateController', () => {
  it('berechnet den Kalorienverbrauch', async () => {
    const res = await request(app).post('/api/calculate').send({
      weight: 70,
      height: 175,
      age: 25,
      gender: 'male',
      activity: 'medium',
      goal: 'gainMuscle',
      burned: 300
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalCalories');
    expect(typeof res.body.totalCalories).toBe('number');
  });

  it('gibt 400er zurück, wenn Daten fehlen', async () => {
    const res = await request(app).post('/api/calculate').send({
      weight: 70,
      // height weggelsassen
      age: 25,
      gender: 'male',
      activity: 'medium',
      goal: 'gainMuscle'
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
