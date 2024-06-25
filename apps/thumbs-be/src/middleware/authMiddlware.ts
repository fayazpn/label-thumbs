import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../main';

export function authMiddlware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization'];

  try {
    const decodedJwt = jwt.verify(token, JWT_SECRET);

    // @ts-ignore
    if (decodedJwt.userId) {
      // @ts-ignore
      req.userId = decodedJwt.userId;

      return next();
    } else {
      res.status(403).json({
        message: 'You are not authorized',
      });
    }
  } catch (error) {
    res.status(403).json({
      message: 'You are not authorized',
    });
  }
}
