// src/entities/application.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Opportunity } from './opportunity.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('applications')
@Unique(['candidate', 'opportunity']) // Prevent duplicate applications
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'candidateId' })
  candidate: User;

  @Column()
  candidateId: number;

  @ManyToOne(() => Opportunity, (opportunity) => opportunity.applications)
  @JoinColumn({ name: 'opportunityId' })
  opportunity: Opportunity;

  @Column()
  opportunityId: number;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  message?: string; // Optional message from candidate

  @Column({ nullable: true })
  note?: string; // Optional internal note for company/admin
}
