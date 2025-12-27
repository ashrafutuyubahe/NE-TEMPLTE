import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Author is required' })
  author: string;

  @IsString()
  @IsNotEmpty({ message: 'ISBN is required' })
  isbn: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1, { message: 'Total copies must be at least 1' })
  @IsNotEmpty({ message: 'Total copies is required' })
  totalCopies: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  publisher?: string;

  @IsNumber()
  @IsOptional()
  publicationYear?: number;
}

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  totalCopies?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  publisher?: string;

  @IsNumber()
  @IsOptional()
  publicationYear?: number;
}

