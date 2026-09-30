import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class CrearPublicacionImagenDto {
  @ApiProperty({
    example: '1',
    description: 'Id de la publicación a la que pertenece la imagen',
  })
  @IsNotEmpty()
  @IsNumberString()
  idPublicacion: string

  @ApiProperty({
    example: 'Portada institucional',
    required: false,
    description: 'Título o epígrafe de la imagen',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string

  @ApiProperty({
    example: 'Fachada principal de la institución',
    required: false,
    description: 'Texto alternativo (atributo alt) para accesibilidad y SEO',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  textoAlternativo?: string

  @ApiProperty({
    example: 1,
    required: false,
    description:
      'Orden secuencial dentro de la galería. Si se omite, se calcula automáticamente',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number

  @ApiProperty({
    example: false,
    required: false,
    description:
      'Marca la imagen como portada. Solo puede haber una portada por publicación',
  })
  @IsOptional()
  @IsBoolean()
  esPortada?: boolean
}

export class RespuestaCrearPublicacionImagenDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'publicaciones/2026/09/1/1700000000000-foto.jpg' })
  @IsNotEmpty()
  urlArchivo: string
}
