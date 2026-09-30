import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { InstitucionEstado } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(InstitucionEstado))
@Entity({ name: 'institucion', schema: process.env.DB_SCHEMA })
export class Institucion extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Institución',
  })
  id: string

  @Column({
    length: 255,
    type: 'varchar',
    nullable: false,
    comment: 'Nombre oficial de la institución',
  })
  nombre: string

  @Column({
    length: 50,
    type: 'varchar',
    nullable: false,
    comment: 'Sigla representativa de la institución (ej: AGETIC)',
  })
  sigla: string

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Reseña o descripción general de la institución',
  })
  descripcion?: string | null

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Misión institucional',
  })
  mision?: string | null

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Visión institucional',
  })
  vision?: string | null

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Objetivos estratégicos o institucionales',
  })
  objetivos?: string | null

  @Column({
    name: 'logo_url',
    length: 500,
    type: 'varchar',
    nullable: true,
    comment: 'Ruta o URL del logotipo principal',
  })
  logoUrl?: string | null

  @Column({
    name: 'logo_secundario_url',
    length: 500,
    type: 'varchar',
    nullable: true,
    comment: 'Ruta o URL del logotipo secundario o favicon',
  })
  logoSecundarioUrl?: string | null

  @Column({
    name: 'direccion_principal',
    length: 255,
    type: 'varchar',
    nullable: true,
    comment: 'Dirección física de la institución',
  })
  direccionPrincipal?: string | null

  @Column({
    length: 100,
    type: 'varchar',
    nullable: true,
    comment: 'Ciudad o departamento sede',
  })
  ciudad?: string | null

  @Column({
    length: 150,
    type: 'varchar',
    nullable: true,
    comment: 'Teléfonos de contacto o central telefónica',
  })
  telefonos?: string | null

  @Column({
    name: 'correo_contacto',
    length: 150,
    type: 'varchar',
    nullable: true,
    comment: 'Correo electrónico principal de atención',
  })
  correoContacto?: string | null

  @Column({
    name: 'correo_soporte',
    length: 150,
    type: 'varchar',
    nullable: true,
    comment: 'Correo de soporte técnico o denuncias',
  })
  correoSoporte?: string | null

  @Column({
    name: 'horario_atencion',
    length: 255,
    type: 'varchar',
    nullable: true,
    comment: 'Horario de atención al público',
  })
  horarioAtencion?: string | null

  @Column({
    name: 'mapa_embed_url',
    length: 500,
    type: 'varchar',
    nullable: true,
    comment: 'Enlace o iframe de Google Maps / OpenStreetMap',
  })
  mapaEmbedUrl?: string | null

  @Column({
    name: 'redes_sociales',
    type: 'jsonb',
    nullable: true,
    default: () => "'{}'::jsonb",
    comment:
      'Objeto JSON con los enlaces a redes sociales (facebook, x, instagram, youtube, tiktok, whatsapp, etc.)',
  })
  redesSociales?: Record<string, string> | null

  @Column({
    name: 'portal_web',
    length: 255,
    type: 'varchar',
    nullable: true,
    comment: 'URL del portal web oficial',
  })
  portalWeb?: string | null

  constructor(data?: Partial<Institucion>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || InstitucionEstado.ACTIVO
  }
}
