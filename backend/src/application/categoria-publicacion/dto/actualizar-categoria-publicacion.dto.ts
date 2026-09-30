import { IsOptional, IsString, MaxLength } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class ActualizarCategoriaPublicacionDto {
  @ApiProperty({
    example: 'NOTICIA',
    description: 'Código único de la categoría',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  codigo?: string

  @ApiProperty({
    example: 'Noticias Institucionales',
    description: 'Nombre descriptivo de la categoría',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string

  @ApiProperty({
    example: 'Novedades y notas de prensa de la institución',
    required: false,
    description: 'Descripción breve de la categoría',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string

  @ApiProperty({
    example: '#1e40af',
    required: false,
    description: 'Color representativo en hexadecimal para UI',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string

  @ApiProperty({
    example: 'newspaper',
    required: false,
    description: 'Nombre del icono para UI',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icono?: string

  @ApiProperty({ example: 'ACTIVO', required: false })
  @IsOptional()
  @IsString()
  estado?: string
}
