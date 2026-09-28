import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // TODO: Student implementation - Part 1: Authentication Middleware
  if (req.method !== 'POST' && req.method !== 'PATCH'){
    return next();
  }

  const rawID = req.headers['x-user-id'];

  if (!rawID || Array.isArray(rawID) || rawID.trim() === ''){
    res.status(401).json({ error: 'Unauthorized: Missing X-User-Id header' });
    return;
  }

  const userId = Number(rawID);
  if (!Number.isInteger(userId) || userId <= 0){
    res.status(401).json({ error: 'Unauthorized: Invalid X-User-Id header' });
    return;
  }

  // Store the authenticated userId on res.locals.userId
  res.locals.userId = userId;
  next();
}

export default authMiddleware;
