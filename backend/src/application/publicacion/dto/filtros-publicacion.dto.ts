import { Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { IsBoolean, IsIn, IsOptional } from '@/common/validation'
import { PublicacionEstado, TipoPublicacion } from '../constant'

export class FiltrosPublicacionDto extends PaginacionQueryDto {
  @ApiPropertyOptional({
    example: TipoPublicacion.NOTICIA,
    description: 'Filtra publicaciones por tipo',
    enum: TipoPublicacion,
  })
  @IsOptional()
  @IsIn(Object.values(TipoPublicacion))
  readonly tipoPublicacion?: string

  @ApiPropertyOptional({
    example: PublicacionEstado.PUBLICADO,
    description: 'Filtra publicaciones por estado',
    enum: PublicacionEstado,
  })
  @IsOptional()
  @IsIn(Object.values(PublicacionEstado))
  readonly estado?: string

  @ApiPropertyOptional({
    example: '1',
    description: 'Filtra publicaciones por id de categoría',
  })
  @IsOptional()
  idCategoria?: string

  @ApiPropertyOptional({
    example: true,
    description: 'Filtra solo publicaciones destacadas',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value === 'true' ? true : value))
  readonly esDestacado?: boolean
}
