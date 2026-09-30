import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class ActualizarPublicacionImagenDto {
  @ApiProperty({
    example: 'Portada institucional',
    description: 'Título o epígrafe de la imagen',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string

  @ApiProperty({
    example: 'Fachada principal de la institución',
    description: 'Texto alternativo (atributo alt) para accesibilidad y SEO',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  textoAlternativo?: string

  @ApiProperty({
    example: 1,
    description: 'Orden secuencial dentro de la galería',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number

  @ApiProperty({
    example: true,
    description:
      'Marca la imagen como portada. Solo puede haber una portada por publicación',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  esPortada?: boolean
}
