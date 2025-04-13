import express, { Request, Response } from 'express';
import calculateRoute from './route/calculateRoute';
import authRoute from './route/authRoute';
import dotenv from 'dotenv';

dotenv.config(); 

const app = express();
const PORT = 8000;

app.use(express.json());

app.use('/api', calculateRoute);
app.use('/auth', authRoute);

//kurzer test obs läuft
app.get('/', (req: Request, res: Response) => {
  res.send('server läuft');
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
