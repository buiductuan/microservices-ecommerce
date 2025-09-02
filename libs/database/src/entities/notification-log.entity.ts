import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NotificationChannel, NotificationStatus, NotificationPriority } from '@app/common/enums';
import { NotificationTemplate } from './notification-template.entity';

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  templateId?: string;

  @ManyToOne(() => NotificationTemplate, { nullable: true })
  @JoinColumn({ name: 'templateId' })
  template?: NotificationTemplate;

  @Column()
  recipientId: string;

  @Column()
  recipientEmail?: string;

  @Column({ nullable: true })
  recipientPhone?: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column()
  subject: string;

  @Column('text')
  content: string;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  externalId?: string;

  @Column('text', { nullable: true })
  errorMessage?: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
