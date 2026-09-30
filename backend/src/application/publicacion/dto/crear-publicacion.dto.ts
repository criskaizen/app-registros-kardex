import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'
import { TipoPublicacion } from '../constant'

export class CrearPublicacionDto {
  @ApiProperty({
    example: '1',
    description: 'Id de la categoría de publicación',
  })
  @IsNotEmpty()
  @IsNumberString()
  idCategoria: string

  @ApiProperty({
    example: TipoPublicacion.NOTICIA,
    description:
      'Tipo de publicación. Debe coincidir con el código de la categoría',
    enum: TipoPublicacion,
  })
  @IsNotEmpty()
  @IsIn(Object.values(TipoPublicacion))
  tipoPublicacion: string

  @ApiProperty({
    example: 'Convocatoria a concurso público',
    description: 'Título de la publicación',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  titulo: string

  @ApiProperty({
    example: 'convocatoria-concurso-publico-2026',
    description:
      'URL amigable única. Si se omite, se genera automáticamente a partir del título',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  slug?: string

  @ApiProperty({
    example: 'Convocatoria abierta para seleccionados al examen de ingreso',
    required: false,
    description: 'Resumen de la publicación para listados',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  resumen?: string

  @ApiProperty({
    example: '<p>Contenido completo de la publicación</p>',
    description: 'Contenido completo (HTML enriquecido o Markdown)',
  })
  @IsNotEmpty()
  @IsString()
  contenido: string

  @ApiProperty({
    example: false,
    required: false,
    description: 'Muestra la publicación en el banner o carrusel principal',
  })
  @IsOptional()
  @IsBoolean()
  esDestacado?: boolean

  @ApiProperty({
    example: '2026-10-01T08:00:00.000Z',
    required: false,
    description:
      'Fecha de publicación. Si se omite o es futura, la publicación queda como BORRADOR',
  })
  @IsOptional()
  @IsDateString()
  fechaPublicacion?: string

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    required: false,
    description: 'Fecha límite de vigencia de la publicación',
  })
  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string
}

export class RespuestaCrearPublicacionDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  id: string
}
