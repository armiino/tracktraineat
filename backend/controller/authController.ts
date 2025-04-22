import { Request, Response } from 'express';
import { validate } from 'class-validator'; 
import { RegisterUserDTO } from '../dto/RegisterUserDto';
import { LoginUserDTO } from '../dto/LoginUserDto';
import { authService } from '../service/authService';

export class AuthController {
  
  async register(req: Request, res: Response): Promise<void> {
    // req.body ist nur ein "plainobjekt"- deswegen hier RegisterUserDTO instazieren und dto zuweisen (lösung wäre plaintoinstance vllt später)
    const dto = new RegisterUserDTO();
    dto.email = req.body.email;
    dto.password = req.body.password;
   // console.log(req.body);

    // validierung: sind alle Decorators aus der dto klasse korrekt? (isEmail() etc..)
    const errors = await validate(dto);
    if (errors.length > 0) {
      // bei Fehlern 400er senden
      res.status(400).json({
        error: 'Validation failed',
        details: errors.map(function(e) {
          return {
            field: e.property,
            constraints: e.constraints,
          };
        })
      });
      return; 
    }

    // wenn keine fehler -> authservice register funktion aufrufen und dto übergeben
    try {
      const user = await authService.register(dto);
      res.status(201).json(user.getPublicProfile());
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // login
  async login(req: Request, res: Response): Promise<void> {
    // same game wie bei register
    const dto = new LoginUserDTO();
    dto.email = req.body.email;
    dto.password = req.body.password;

    const errors = await validate(dto);
    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.map(function(e) {
          return {
            field: e.property,
            constraints: e.constraints,
          };
        })
      });
      return;
    }

    try {
      // lgoin von authService liefert einen JWTToken -> für später und für middleware 
      const token = await authService.login(dto.email, dto.password);
      //hiermit wird der token im cookie gespeichert und automatisch bei den nächsten requests mitgesendet (zB bei postman tests)
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, 
        sameSite: 'lax',
      });
      res.status(200).json({ message: 'AuthControllerInfo: login succesfull' });
  
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}
