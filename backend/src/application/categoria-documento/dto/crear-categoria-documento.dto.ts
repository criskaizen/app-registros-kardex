import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class CrearCategoriaDocumentoDto {
  @ApiProperty({
    example: 'FORMULARIO',
    description: 'Código único de la categoría',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  codigo: string

  @ApiProperty({
    example: 'Formularios de Trámite',
    description: 'Nombre de la categoría',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  nombre: string

  @ApiProperty({
    example: 'Formularios oficiales para trámites ciudadanos',
    required: false,
    description: 'Descripción breve de la categoría',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string
}

export class RespuestaCrearCategoriaDocumentoDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  id: string
}
