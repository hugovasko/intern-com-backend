import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: null,
    });
  }

  async createSubscription(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id.toString(),
          },
        });
        customerId = customer.id;
        user.stripeCustomerId = customerId;
        await this.userRepository.save(user);
      }

      const existingSubscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'incomplete',
      });

      for (const subscription of existingSubscriptions.data) {
        await this.stripe.subscriptions.cancel(subscription.id);
      }

      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: this.configService.get('STRIPE_PRICE_ID') }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: user.id.toString(),
        },
      });

      user.subscriptionId = subscription.id;
      user.subscriptionStatus = subscription.status;
      await this.userRepository.save(user);

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      return {
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new BadRequestException('Failed to create subscription');
    }
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
      console.log('Webhook event received:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId =
            typeof subscription.customer === 'string'
              ? subscription.customer
              : subscription.customer.id;

          console.log('Processing subscription event:', {
            subscriptionId: subscription.id,
            customerId: customerId,
            status: subscription.status,
          });

          const user = await this.userRepository.findOne({
            where: { stripeCustomerId: customerId },
          });

          if (user) {
            user.subscriptionStatus = subscription.status;
            user.subscriptionEndDate = new Date(
              subscription.current_period_end * 1000,
            );
            await this.userRepository.save(user);
            console.log(
              `Updated subscription status for user ${user.id} to ${subscription.status}`,
            );
          }
          break;
        }
      }

      return { received: true };
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  async cancelSubscription(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.subscriptionId) {
      throw new BadRequestException('No active subscription found');
    }

    const subscription = await this.stripe.subscriptions.cancel(
      user.subscriptionId,
    );

    user.subscriptionStatus = subscription.status;
    await this.userRepository.save(user);

    return { status: subscription.status };
  }

  async hasActiveSubscription(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user?.subscriptionStatus === 'active';
  }

  async verifyPayment(paymentIntentId: string) {
    console.log(`Verifying payment for PaymentIntent: ${paymentIntentId}`);

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId,
        {
          expand: [
            'customer',
            'invoice.payment_intent',
            'invoice.subscription',
          ],
        },
      );
      console.log(`Payment status: ${paymentIntent.status}`);

      if (paymentIntent.status === 'succeeded') {
        const customerId =
          typeof paymentIntent.customer === 'string'
            ? paymentIntent.customer
            : paymentIntent.customer.id;

        const invoice = paymentIntent.invoice as Stripe.Invoice;
        const subscription = invoice?.subscription as Stripe.Subscription;

        console.log(`Customer ID: ${customerId}`);
        console.log('Subscription:', subscription?.id);

        // Try to find user by metadata first, then by customer ID
        let user = null;

        if (subscription?.metadata?.userId) {
          user = await this.userRepository.findOne({
            where: { id: parseInt(subscription.metadata.userId) },
          });
        }

        if (!user) {
          user = await this.userRepository.findOne({
            where: { stripeCustomerId: customerId },
          });
        }

        if (!user) {
          console.log('No user found with customerID:', customerId);
          throw new BadRequestException('User not found');
        }

        if (subscription) {
          console.log(
            `Updating user ${user.id} with subscription ${subscription.id}`,
          );
          user.subscriptionStatus = 'active';
          user.subscriptionId = subscription.id;
          user.subscriptionEndDate = new Date(
            subscription.current_period_end * 1000,
          );
          if (!user.stripeCustomerId) {
            user.stripeCustomerId = customerId;
          }

          await this.userRepository.save(user);
          console.log('User subscription updated successfully');
        } else {
          console.log('No subscription found in payment intent');
          throw new BadRequestException('No subscription found');
        }

        return { status: 'success' };
      }

      throw new BadRequestException('Payment verification failed');
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new BadRequestException(
        error.message || 'Payment verification failed',
      );
    }
  }
}
