// src/middlewares/stripe-webhook.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class StripeWebhookMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl === '/subscriptions/webhook' && req.method === 'POST') {
      req['rawBody'] = req['body'];
    }
    next();
  }
}
