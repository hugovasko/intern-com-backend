// src/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Opportunity } from './opportunity.entity';
import { Application } from './application.entity';

export enum UserRole {
  CANDIDATE = 'candidate',
  PARTNER = 'partner',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true, nullable: true })
  githubId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CANDIDATE,
  })
  role: UserRole;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  companyCoordinates: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Opportunity, (opportunity) => opportunity.company)
  opportunities: Opportunity[];

  @Column({ type: 'bytea', nullable: true })
  cv: Buffer;

  @Column({ nullable: true })
  cvFileName: string;

  @Column({ nullable: true })
  cvMimeType: string;

  @Column({ nullable: true })
  cvUploadedAt: Date;

  @OneToMany(() => Application, (application) => application.candidate)
  applications: Application[];
}
