import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'Main Branch' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'MAIN' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: '12 Market Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsUUID()
  storeId: string;
}
