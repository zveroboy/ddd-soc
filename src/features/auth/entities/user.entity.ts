import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users', {
  schema: process.env.DB_SCHEMA,
})
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}