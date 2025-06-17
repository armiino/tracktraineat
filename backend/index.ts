import dotenv from 'dotenv';
dotenv.config(); //muss vor allen imports kommen sonst wird der wert "zu spät" erkannt (fix warum dotenv value nicht genutzt wurde)
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import calculateRoute from './route/calculateRoute';
import authRoute from './route/authRoute';
import testMiddlewareRoute from './route/testMiddlewareRoute'; // TODO: wieder entfernen - dient nur zu testzwecken der Middleware
//import userProfileRoute from './route/userProfileRoute';
import calculateProfileRoute from './route/calculateProfileRoute';
import { createRecipeRoute } from './route/recipeRoute';
import { createUserProfileRoute } from './route/userProfileRoute';

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cookieParser());

app.use('/api', calculateRoute); //offener endpunkt und kalulkuliert den Gesamtumsatz
//app.use('/api', userProfileRoute); //profil anlegen oder updaten
app.use('/auth', authRoute); //register und login TODO: evtl auch auf factory umziehen
app.use('/test', testMiddlewareRoute); // TODO: wieder entfernen
app.use('/api', calculateProfileRoute);
app.use('/api', createRecipeRoute()); 
app.use('/api', createUserProfileRoute());

//kurzer test obs läuft
app.get('/', (req: Request, res: Response) => {
  res.send('Server läuft');
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

export default app;