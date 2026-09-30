import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'
import { PublicacionEstado, TipoPublicacion } from '../constant'

export class ActualizarPublicacionDto {
  @ApiProperty({
    example: '1',
    description: 'Id de la categoría de publicación',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  idCategoria?: string

  @ApiProperty({
    example: TipoPublicacion.NOTICIA,
    description:
      'Tipo de publicación. Debe coincidir con el código de la categoría',
    enum: TipoPublicacion,
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(TipoPublicacion))
  tipoPublicacion?: string

  @ApiProperty({
    example: 'Convocatoria a concurso público',
    description: 'Título de la publicación',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string

  @ApiProperty({
    example: 'convocatoria-concurso-publico-2026',
    description: 'URL amigable única de la publicación',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  slug?: string

  @ApiProperty({
    example: 'Convocatoria abierta para seleccionados al examen de ingreso',
    description: 'Resumen de la publicación para listados',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  resumen?: string

  @ApiProperty({
    example: '<p>Contenido completo de la publicación</p>',
    description: 'Contenido completo (HTML enriquecido o Markdown)',
    required: false,
  })
  @IsOptional()
  @IsString()
  contenido?: string

  @ApiProperty({
    example: false,
    description: 'Muestra la publicación en el banner o carrusel principal',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  esDestacado?: boolean

  @ApiProperty({
    example: '2026-10-01T08:00:00.000Z',
    description: 'Fecha de publicación',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaPublicacion?: string

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Fecha límite de vigencia de la publicación',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string

  @ApiProperty({
    example: PublicacionEstado.PUBLICADO,
    description: 'Estado de la publicación',
    enum: PublicacionEstado,
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(PublicacionEstado))
  estado?: string
}
