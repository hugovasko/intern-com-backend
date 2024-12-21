// src/entities/opportunity.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  salary: string;

  @Column()
  type: string; // e.g., 'internship', 'full-time', etc.

  @Column()
  field: string; // design, engineering, marketing

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.opportunities)
  company: User;
}
