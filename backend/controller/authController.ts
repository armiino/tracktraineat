import { Request, Response } from "express";
import { validate } from "class-validator";
import { RegisterUserDTO } from "../dto/RegisterUserDto";
import { LoginUserDTO } from "../dto/LoginUserDto";
import { authService as AuthServiceType } from "../service/authService";
import { RequestWithUser } from "../globalTypes/RequestWithUser";

export class AuthController {
  constructor(
    private readonly authService: ReturnType<typeof AuthServiceType>
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    // req.body ist nur ein "plainobjekt"- deswegen hier RegisterUserDTO instazieren und dto zuweisen (lösung wäre plaintoinstance vllt später)
    const dto = new RegisterUserDTO();
    dto.email = req.body.email;
    dto.password = req.body.password;

    // validierung: sind alle Decorators aus der dto klasse korrekt? (isEmail() etc..)
    const errors = await validate(dto);
    if (errors.length > 0) {
      // bei Fehlern 400er senden
      res.status(400).json({
        error: "Validation failed",
        details: errors.map(function (e) {
          return {
            field: e.property,
            constraints: e.constraints,
          };
        }),
      });
      return;
    }

    // wenn keine fehler -> authservice register funktion aufrufen und dto übergeben
    try {
      const user = await this.authService.register(dto);
      res.status(201).json(user.getPublicProfile());
    } catch (error: any) {
      console.error("Fehler bei der Registrierung:", error);
      if (error.code === "email_taken") {
        res.status(409).json({ code: "email_taken" });
      } else {
        res.status(500).json({ code: "register_failed" });
      }
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
        error: "Validation failed",
        details: errors.map(function (e) {
          return {
            field: e.property,
            constraints: e.constraints,
          };
        }),
      });
      return;
    }

    try {
      // lgoin von authService liefert einen JWTToken -> für später und für middleware
      const token = await this.authService.login(dto.email, dto.password);
      //hiermit wird der token im cookie gespeichert und automatisch bei den nächsten requests mitgesendet (zB bei postman tests)
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 2, //damit cookie ne bestimmte lebenszeit hat
      });

      res.status(200).json({ message: "AuthController: login succesfull" });
    } catch (error: any) {
      console.error("Fehler beim Login:", error);
      if (error.code === "invalid_credentials") {
        res.status(401).json({ code: "invalid_credentials" });
      } else {
        res.status(500).json({ code: "login_failed" });
      }
    }
  }
  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      res.status(200).json({ message: "Logout erfolgreich" });
    } catch (error: any) {
      console.error("Fehler beim Logout:", error);
      res.status(500).json({ code: "logout_failed" });
    }
  }

  //test fürs frontend,.. ob user zulässig ja nein
  async validate(req: RequestWithUser, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ authenticated: false });
      return;
    }
    const user = req.user;
    res.status(200).json({ authenticated: true, user });
  }
}
