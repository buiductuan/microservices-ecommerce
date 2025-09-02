import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { NotificationType, NotificationTemplate } from '@app/common';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipient: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationTemplate,
  })
  template: NotificationTemplate;

  @Column({ nullable: true })
  subject: string;

  @Column('text', { nullable: true })
  content: string;

  @Column('json', { nullable: true })
  data: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ['sent', 'failed', 'pending'],
    default: 'pending',
  })
  status: 'sent' | 'failed' | 'pending';

  @Column('text', { nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  sentAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
