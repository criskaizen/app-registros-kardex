import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class InstitucionDto {
  @ApiProperty({
    example: 'Agencia de Gobierno Electrónico y Tecnologías de Información',
    description: 'Nombre oficial de la institución',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  nombre: string

  @ApiProperty({
    example: 'AGETIC',
    description: 'Sigla representativa de la institución',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  sigla: string

  @ApiProperty({
    example: 'Organismo público encargado de promover el gobierno electrónico',
    required: false,
    description: 'Reseña o descripción general',
  })
  @IsOptional()
  @IsString()
  descripcion?: string

  @ApiProperty({
    example: 'Modernizar la gestión pública del país',
    required: false,
    description: 'Misión institucional',
  })
  @IsOptional()
  @IsString()
  mision?: string

  @ApiProperty({
    example: 'Ser referente en innovación tecnológica institucional',
    required: false,
    description: 'Visión institucional',
  })
  @IsOptional()
  @IsString()
  vision?: string

  @ApiProperty({
    example: 'Impulsar la digitalización de los trámites del Estado',
    required: false,
    description: 'Objetivos estratégicos o institucionales',
  })
  @IsOptional()
  @IsString()
  objetivos?: string

  @ApiProperty({
    example: 'logo/logo-principal.png',
    required: false,
    description: 'Ruta o URL del logotipo principal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string

  @ApiProperty({
    example: 'logo/favicon.png',
    required: false,
    description: 'Ruta o URL del logotipo secundario o favicon',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoSecundarioUrl?: string

  @ApiProperty({
    example: 'Av. Siempre Mas 123, Edificio Central',
    required: false,
    description: 'Dirección física de la institución',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccionPrincipal?: string

  @ApiProperty({
    example: 'La Paz',
    required: false,
    description: 'Ciudad o departamento sede',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string

  @ApiProperty({
    example: '+591 2 2000000',
    required: false,
    description: 'Teléfonos de contacto o central telefónica',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  telefonos?: string

  @ApiProperty({
    example: 'contacto@institucion.gob.bo',
    required: false,
    description: 'Correo electrónico principal de atención',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  correoContacto?: string

  @ApiProperty({
    example: 'soporte@institucion.gob.bo',
    required: false,
    description: 'Correo de soporte técnico o denuncias',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  correoSoporte?: string

  @ApiProperty({
    example: 'Lunes a viernes de 08:00 a 18:00',
    required: false,
    description: 'Horario de atención al público',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  horarioAtencion?: string

  @ApiProperty({
    example: 'https://maps.google.com/?q=LaPaz',
    required: false,
    description: 'Enlace o iframe de Google Maps / OpenStreetMap',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  mapaEmbedUrl?: string

  @ApiProperty({
    example: {
      facebook: 'https://facebook.com/institucion',
      x: 'https://x.com/institucion',
      instagram: 'https://instagram.com/institucion',
    },
    required: false,
    description:
      'Objeto JSON libre con los enlaces a redes sociales. Las claves son libres (facebook, x, instagram, youtube, tiktok, whatsapp, etc.)',
  })
  @IsOptional()
  @IsObject()
  redesSociales?: Record<string, string>

  @ApiProperty({
    example: 'https://www.institucion.gob.bo',
    required: false,
    description: 'URL del portal web oficial',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  portalWeb?: string
}
