import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import dotenv from 'dotenv'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { CategoriaPublicacion } from '@/application/categoria-publicacion/entity'
import { PublicacionImagen } from './publicacion-imagen.entity'
import { PublicacionEstado, TipoPublicacion } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(PublicacionEstado))
@Check(UtilService.buildCheck('tipo_publicacion', TipoPublicacion))
@Entity({ name: 'publicaciones', schema: process.env.DB_SCHEMA })
export class Publicacion extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Publicación',
  })
  id: string

  @Column({
    name: 'id_categoria',
    type: 'bigint',
    nullable: false,
    comment: 'Id de la categoría de publicación (categorias_publicacion.id)',
  })
  idCategoria: string

  @ManyToOne(() => CategoriaPublicacion, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_categoria' })
  categoria: CategoriaPublicacion

  @Column({
    name: 'tipo_publicacion',
    length: 30,
    type: 'varchar',
    nullable: false,
    comment:
      'Tipo de publicación (NOTICIA, COMUNICADO, CONVOCATORIA). Debe coincidir con el código de la categoría',
  })
  tipoPublicacion: string

  @Column({
    length: 255,
    type: 'varchar',
    nullable: false,
    comment: 'Título de la publicación',
  })
  titulo: string

  @Index()
  @Column({
    length: 300,
    type: 'varchar',
    nullable: false,
    unique: true,
    comment: 'URL amigable única de la publicación',
  })
  slug: string

  @Column({
    length: 500,
    type: 'varchar',
    nullable: true,
    comment: 'Resumen o bajada de la publicación para listados',
  })
  resumen?: string | null

  @Column({
    type: 'text',
    nullable: false,
    comment: 'Contenido completo de la publicación (HTML o Markdown)',
  })
  contenido: string

  @Column({
    name: 'es_destacado',
    type: 'boolean',
    nullable: false,
    default: false,
    comment:
      'Indica si la publicación se muestra en el banner o carrusel principal',
  })
  esDestacado: boolean

  @Column({
    name: 'fecha_publicacion',
    type: 'timestamp without time zone',
    nullable: false,
    default: () => 'now()',
    comment: 'Fecha y hora en que se publica o programa la publicación',
  })
  fechaPublicacion: Date

  @Column({
    name: 'fecha_vencimiento',
    type: 'timestamp without time zone',
    nullable: true,
    comment: 'Fecha límite de vigencia de la publicación',
  })
  fechaVencimiento?: Date | null

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
    comment: 'Contador de visitas a la publicación',
  })
  vistas: number

  @OneToMany(() => PublicacionImagen, (imagen) => imagen.publicacion)
  imagenes: PublicacionImagen[]

  constructor(data?: Partial<Publicacion>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || PublicacionEstado.BORRADOR
  }
}
