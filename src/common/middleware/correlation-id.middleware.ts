import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerName = 'x-correlation-id';
    const correlationId = req.header(headerName) || uuidv4();
    
    // Attach to request headers so it can be extracted later
    req.headers[headerName] = correlationId;
    
    // Add to response header
    res.setHeader(headerName, correlationId);
    
    next();
  }
}
