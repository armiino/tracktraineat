import dotenv from 'dotenv';
dotenv.config(); //muss vor allen imports kommen sonst wird der wert "zu spät" erkannt (fix warum dotenv value nicht genutzt wurde)
import express, { Request, Response } from 'express';
import calculateRoute from './route/calculateRoute';
import authRoute from './route/authRoute';
import testMiddlewareRoute from './route/testMiddlewareRoute'; // TODO: wieder entfernen - dient nur zu testzwecken der Middleware
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 8000;

app.use(express.json());

app.use(cookieParser()); 

app.use('/api', calculateRoute);
app.use('/auth', authRoute);
app.use('/test', testMiddlewareRoute); // TODO: wieder entfernen

//kurzer test obs läuft
app.get('/', (req: Request, res: Response) => {
  res.send('server läuft');
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
