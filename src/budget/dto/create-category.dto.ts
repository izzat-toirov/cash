import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Fastfood', description: 'Kategoriya nomi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    example: 'expense', 
    enum: ['income', 'expense'], 
    description: 'Kategoriya turi' 
  })
  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';
}