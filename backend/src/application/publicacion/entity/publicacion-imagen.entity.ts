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
import { Publicacion } from './publicacion.entity'
import { PublicacionImagenEstado } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(PublicacionImagenEstado))
@Entity({ name: 'publicaciones_imagenes', schema: process.env.DB_SCHEMA })
export class PublicacionImagen extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Publicación Imagen',
  })
  id: string

  @Column({
    name: 'id_publicacion',
    type: 'bigint',
    nullable: false,
    comment: 'Id de la publicación a la que pertenece la imagen',
  })
  idPublicacion: string

  @ManyToOne(() => Publicacion, (publicacion) => publicacion.imagenes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Publicacion

  @Column({
    length: 255,
    type: 'varchar',
    nullable: true,
    comment: 'Título o epígrafe de la imagen',
  })
  titulo?: string | null

  @Column({
    name: 'texto_alternativo',
    length: 255,
    type: 'varchar',
    nullable: true,
    comment: 'Texto alternativo (atributo alt) para accesibilidad y SEO',
  })
  textoAlternativo?: string | null

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
    nullable: true,
    comment: 'Nombre original del archivo subido por el usuario',
  })
  nombreArchivoOriginal?: string | null

  @Column({
    name: 'mime_type',
    length: 50,
    type: 'varchar',
    nullable: false,
    comment: 'Tipo MIME de la imagen (image/jpeg, image/png, image/webp)',
  })
  mimeType: string

  @Column({
    name: 'tamano_bytes',
    type: 'integer',
    nullable: true,
    comment: 'Tamaño del archivo en bytes',
  })
  tamanoBytes?: number | null

  @Column({
    name: 'es_portada',
    type: 'boolean',
    nullable: false,
    default: false,
    comment: 'Indica si la imagen es la portada de la publicación',
  })
  esPortada: boolean

  @Index()
  @Column({
    type: 'integer',
    nullable: false,
    default: 1,
    comment: 'Orden secuencial de la imagen dentro de la galería',
  })
  orden: number

  constructor(data?: Partial<PublicacionImagen>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || PublicacionImagenEstado.ACTIVO
  }
}
