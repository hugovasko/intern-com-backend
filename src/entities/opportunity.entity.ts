// src/entities/opportunity.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Application } from './application.entity';

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
  salary: number;

  @Column()
  type: string; // e.g., 'internship', 'full-time', etc.

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.opportunities)
  company: User;

  @OneToMany(() => Application, (application) => application.opportunity)
  applications: Application[];
}
