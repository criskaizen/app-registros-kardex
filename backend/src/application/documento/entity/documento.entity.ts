import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { CategoriaDocumento } from '@/application/categoria-documento/entity'
import { DocumentoEstado } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(DocumentoEstado))
@Index('uq_documentos_codigo_version', ['codigoDocumento', 'version'], {
  unique: true,
  where: 'codigo_documento IS NOT NULL',
})
@Entity({ name: 'documentos_descargables', schema: process.env.DB_SCHEMA })
export class Documento extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Documento Descargable',
  })
  id: string

  @Column({
    name: 'id_categoria',
    type: 'bigint',
    nullable: false,
    comment: 'Id de la categoría del documento (categorias_documento.id)',
  })
  idCategoria: string

  @ManyToOne(() => CategoriaDocumento, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_categoria' })
  categoria: CategoriaDocumento

  @Index()
  @Column({
    name: 'codigo_documento',
    length: 50,
    type: 'varchar',
    nullable: true,
    comment: 'Código oficial del documento (ej: FORM-KARDEX-01)',
  })
  codigoDocumento?: string | null

  @Column({
    length: 255,
    type: 'varchar',
    nullable: false,
    comment: 'Título o nombre del documento descargable',
  })
  titulo: string

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Instrucciones de llenado o detalle del documento',
  })
  descripcion?: string | null

  @Column({
    length: 20,
    type: 'varchar',
    nullable: true,
    comment: 'Versión del documento (ej: v1.0, 2024)',
  })
  version?: string | null

  @Column({
    name: 'url_archivo',
    length: 500,
    type: 'varchar',
    nullable: false,
    comment: 'Ruta relativa del archivo dentro del almacenamiento',
  })
  urlArchivo: string

  @Column({
    name: 'nombre_archivo_original',
    length: 255,
    type: 'varchar',
    nullable: false,
    comment: 'Nombre con el que se subió el archivo',
  })
  nombreArchivoOriginal: string

  @Column({
    name: 'mime_type',
    length: 50,
    type: 'varchar',
    nullable: false,
    default: 'application/pdf',
    comment: 'Formato del archivo (application/pdf)',
  })
  mimeType: string

  @Column({
    name: 'tamano_bytes',
    type: 'bigint',
    nullable: true,
    comment: 'Peso del archivo en bytes',
  })
  tamanoBytes?: number | null

  @Column({
    name: 'nro_descargas',
    type: 'integer',
    nullable: false,
    default: 0,
    comment: 'Contador de descargas realizadas',
  })
  nroDescargas: number

  @Column({
    name: 'es_destacado',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Si aparece en la sección de descargas populares',
  })
  esDestacado: boolean

  @Column({
    name: 'fecha_publicacion',
    type: 'timestamp without time zone',
    nullable: false,
    default: () => 'now()',
    comment: 'Fecha de puesta a disposición del público',
  })
  fechaPublicacion: Date

  constructor(data?: Partial<Documento>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || DocumentoEstado.ACTIVO
  }
}
