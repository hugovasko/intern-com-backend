// src/subscriptions/subscriptions.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Headers,
  Delete,
  Body,
  Req,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.PARTNER)
  async getSubscriptionStatus(@Request() req) {
    return this.subscriptionsService.hasActiveSubscription(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.PARTNER)
  async createSubscription(@Request() req) {
    return this.subscriptionsService.createSubscription(req.user.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.PARTNER)
  async cancelSubscription(@Request() req) {
    return this.subscriptionsService.cancelSubscription(req.user.id);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request,
  ) {
    return this.subscriptionsService.handleWebhook(
      signature,
      req['rawBody'] || req.body,
    );
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.PARTNER)
  async verifyPayment(
    @Request() req,
    @Body('paymentIntent') paymentIntentId: string,
  ) {
    return this.subscriptionsService.verifyPayment(paymentIntentId);
  }
}
