import { Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { IsBoolean, IsIn, IsOptional } from '@/common/validation'
import { DocumentoEstado } from '../constant'

export class FiltrosDocumentoDto extends PaginacionQueryDto {
  @ApiPropertyOptional({
    example: '1',
    description: 'Filtra documentos por id de categoría',
  })
  @IsOptional()
  idCategoria?: string

  @ApiPropertyOptional({
    example: 'FORM-KARDEX-01',
    description: 'Filtra documentos por código oficial',
  })
  @IsOptional()
  codigoDocumento?: string

  @ApiPropertyOptional({
    example: DocumentoEstado.ACTIVO,
    description: 'Filtra documentos por estado',
    enum: DocumentoEstado,
  })
  @IsOptional()
  @IsIn(Object.values(DocumentoEstado))
  readonly estado?: string

  @ApiPropertyOptional({
    example: true,
    description: 'Filtra solo documentos destacados',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value === 'true' ? true : value))
  readonly esDestacado?: boolean
}
