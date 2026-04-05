import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class BudgetQueryDto {
  @ApiPropertyOptional({
    description: 'Oy raqami (1–12). Kiritilmasa joriy oy ishlatiladi.',
    example: 4,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({
    description: 'Yil. Kiritilmasa joriy yil ishlatiladi.',
    example: 2026,
    minimum: 2000,
    maximum: 2100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}

export class SetInitialAmountDto {
  @ApiProperty({
    description: "Boshlang'ich summa (UZS). Svodka!I8 ga yoziladi.",
    example: 5000000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;
}
