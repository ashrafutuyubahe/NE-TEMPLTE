import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BorrowRequest } from './BorrowRequest';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column()
  isbn: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  totalCopies: number;

  @Column({ default: 0 })
  availableCopies: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  publisher: string;

  @Column({ type: 'int', nullable: true })
  publicationYear: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BorrowRequest, (borrowRequest) => borrowRequest.book)
  borrowRequests: BorrowRequest[];
}

