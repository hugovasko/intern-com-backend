// src/database/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User } from '../entities/user.entity';
import { Opportunity } from '../entities/opportunity.entity';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/user.entity'; // Import UserRole
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get('UserRepository') as Repository<User>;
  const opportunityRepository = app.get(
    'OpportunityRepository',
  ) as Repository<Opportunity>;

  // Clear existing data
  await opportunityRepository.delete({});
  await userRepository.delete({});

  // Hash the password for all users
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create admin users
  await userRepository.save({
    firstName: 'Admin',
    lastName: 'One',
    email: 'admin1@example.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
  });

  await userRepository.save({
    firstName: 'Admin',
    lastName: 'Two',
    email: 'admin2@example.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
  });

  // Create partner users
  const partners = [];
  for (let i = 1; i <= 5; i++) {
    partners.push(
      await userRepository.save({
        firstName: 'Partner',
        lastName: `${i}`,
        email: `partner${i}@company${i}.com`,
        password: hashedPassword,
        role: UserRole.PARTNER,
        companyName: `Company ${i}`,
      }),
    );
  }

  // Create candidate users
  for (let i = 1; i <= 5; i++) {
    await userRepository.save({
      firstName: 'Candidate',
      lastName: `${i}`,
      email: `candidate${i}@example.com`,
      password: hashedPassword,
      role: UserRole.CANDIDATE,
    });
  }

  // Create opportunities for each partner
  for (const partner of partners) {
    for (let i = 1; i <= 5; i++) {
      await opportunityRepository.save({
        title: `${partner.companyName} Opportunity ${i}`,
        description: `This is a great opportunity at ${partner.companyName}.`,
        location: ['New York', 'London', 'Berlin', 'Paris', 'Tokyo'][
          Math.floor(Math.random() * 5)
        ],
        salary: `${Math.floor(Math.random() * 50) + 50}k - ${
          Math.floor(Math.random() * 50) + 100
        }k`,
        type: Math.random() > 0.5 ? 'internship' : 'full-time',
        company: partner,
      });
    }
  }

  console.log('Seeding completed!');
  await app.close();
}

bootstrap().catch((error) => {
  console.error('Error seeding database:', error);
});
