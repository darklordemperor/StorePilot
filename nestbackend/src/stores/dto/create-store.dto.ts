import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'Downtown Market' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'DTM' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Primary retail store' })
  @IsOptional()
  @IsString()
  description?: string;
}
