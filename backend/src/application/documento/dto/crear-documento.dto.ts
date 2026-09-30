import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class CrearDocumentoDto {
  @ApiProperty({
    example: '1',
    description: 'Id de la categoría del documento',
  })
  @IsNotEmpty()
  @IsNumberString()
  idCategoria: string

  @ApiProperty({
    example: 'FORM-KARDEX-01',
    required: false,
    description: 'Código oficial del documento',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigoDocumento?: string

  @ApiProperty({
    example: 'Formulario de Inscripción',
    description: 'Título o nombre del documento descargable',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  titulo: string

  @ApiProperty({
    example: 'Complete en mayúsculas y adjunte la documentación requerida',
    required: false,
    description: 'Instrucciones de llenado o detalle del documento',
  })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({
    example: 'v1.0',
    required: false,
    description: 'Versión del documento',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  version?: string

  @ApiProperty({
    example: false,
    required: false,
    description: 'Muestra el documento en la sección de descargas populares',
  })
  @IsOptional()
  @IsBoolean()
  esDestacado?: boolean

  @ApiProperty({
    example: '2026-10-01T08:00:00.000Z',
    required: false,
    description: 'Fecha de puesta a disposición del público',
  })
  @IsOptional()
  @IsDateString()
  fechaPublicacion?: string
}

export class RespuestaCrearDocumentoDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  id: string

  @ApiProperty({ example: 'documentos/2026/09/1/1700000000000-formulario.pdf' })
  @IsNotEmpty()
  urlArchivo: string
}
