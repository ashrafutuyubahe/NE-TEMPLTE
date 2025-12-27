import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateBorrowRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Book ID is required' })
  bookId: string;

  @IsInt()
  @Min(1, { message: 'Borrow duration must be at least 1 day' })
  @Max(30, { message: 'Borrow duration cannot exceed 30 days' })
  @IsOptional()
  borrowDurationDays?: number;
}

export class UpdateBorrowRequestDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

