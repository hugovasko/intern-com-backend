import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Admin can access everything
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Only check subscription for partners
    if (user.role === UserRole.PARTNER) {
      return this.subscriptionsService.hasActiveSubscription(user.id);
    }

    return true;
  }
}
