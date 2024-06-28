import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function userAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers['authorization'] ?? '';

  try {
    const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);

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

export function workerAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers['authorization'] ?? '';

  try {
    const decodedJwt = jwt.verify(token, process.env.JWT_SECRET_WORKER);

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
