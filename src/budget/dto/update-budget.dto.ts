import { PartialType } from '@nestjs/swagger';
import { BudgetQueryDto } from './create-budget.dto';

export class UpdateBudgetDto extends PartialType(BudgetQueryDto) {}
