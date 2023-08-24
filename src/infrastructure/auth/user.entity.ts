/* eslint-disable no-useless-constructor */

/* eslint-disable max-classes-per-file */
import { User, UserProps } from '#domain/index.js';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users', {
  // Pass from config module
  schema: process.env.DB_SCHEMA,
})
export class UserEntity extends User implements UserProps {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  declare userId: string;

  @Column({ unique: true })
  declare email: string;

  @Column({ select: false })
  declare password: string;

  @Column()
  declare confirmed: boolean;

  @Column({ name: 'confirmation_token', nullable: true, type: 'text' })
  declare confirmationToken: string | null;
}
