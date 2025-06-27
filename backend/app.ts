import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config(); //muss vor allen imports kommen sonst wird der wert "zu spät" erkannt (fix warum dotenv value nicht genutzt wurde)

import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import calculateRoute from './route/calculateRoute';
import authRoute from './route/authRoute';
import calculateProfileRoute from './route/calculateProfileRoute';
import { createRecipeRoute } from './route/recipeRoute';
import { createUserProfileRoute } from './route/userProfileRoute';
import savedRecipeRoute from './route/savedRecipeRoute';
const app = express();
app.disable("x-powered-by");
const PORT = 8000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use('/api', calculateRoute); //offener endpunkt und kalulkuliert den Gesamtumsatz
app.use('/auth', authRoute); //register und login 
app.use('/api', calculateProfileRoute);
app.use('/api', createRecipeRoute()); 
app.use('/api', createUserProfileRoute());
app.use('/api', savedRecipeRoute);

//kurzer test obs läuft
app.get('/', (req: Request, res: Response) => {
  res.send('Server läuft');
});

export { app };