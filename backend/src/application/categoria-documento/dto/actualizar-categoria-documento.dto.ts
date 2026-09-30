import { IsOptional, IsString, MaxLength } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class ActualizarCategoriaDocumentoDto {
  @ApiProperty({
    example: 'FORMULARIO',
    description: 'Código único de la categoría',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  codigo?: string

  @ApiProperty({
    example: 'Formularios de Trámite',
    description: 'Nombre de la categoría',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string

  @ApiProperty({
    example: 'Formularios oficiales para trámites ciudadanos',
    description: 'Descripción breve de la categoría',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string

  @ApiProperty({ example: 'ACTIVO', required: false })
  @IsOptional()
  @IsString()
  estado?: string
}
