import {
  IsBoolean,
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class ActualizarDocumentoDto {
  @ApiProperty({
    example: '1',
    description: 'Id de la categoría del documento',
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  idCategoria?: string

  @ApiProperty({
    example: 'FORM-KARDEX-01',
    description: 'Código oficial del documento',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigoDocumento?: string

  @ApiProperty({
    example: 'Formulario de Inscripción',
    description: 'Título o nombre del documento descargable',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titulo?: string

  @ApiProperty({
    example: 'Complete en mayúsculas y adjunte la documentación requerida',
    description: 'Instrucciones de llenado o detalle del documento',
    required: false,
  })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({
    example: 'v1.1',
    description: 'Versión del documento',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  version?: string

  @ApiProperty({
    example: true,
    description: 'Muestra el documento en la sección de descargas populares',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  esDestacado?: boolean

  @ApiProperty({
    example: '2026-10-01T08:00:00.000Z',
    description: 'Fecha de puesta a disposición del público',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaPublicacion?: string

  @ApiProperty({ example: 'ACTIVO', required: false })
  @IsOptional()
  @IsString()
  estado?: string
}
