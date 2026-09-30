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
import { CategoriaPublicacionEstado } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(CategoriaPublicacionEstado))
@Entity({ name: 'categorias_publicacion', schema: process.env.DB_SCHEMA })
export class CategoriaPublicacion extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Categoría Publicación',
  })
  id: string

  @Column({
    length: 30,
    type: 'varchar',
    unique: true,
    comment:
      'Código único de la categoría (ej: NOTICIA, COMUNICADO, CONVOCATORIA)',
  })
  codigo: string

  @Column({
    length: 100,
    type: 'varchar',
    comment: 'Nombre descriptivo de la categoría',
  })
  nombre: string

  @Column({
    length: 255,
    type: 'varchar',
    nullable: true,
    comment: 'Descripción breve de la categoría',
  })
  descripcion?: string | null

  @Column({
    length: 20,
    type: 'varchar',
    nullable: true,
    comment:
      'Color representativo en formato hexadecimal para UI (ej: #004b93)',
  })
  color?: string | null

  @Column({
    length: 50,
    type: 'varchar',
    nullable: true,
    comment: 'Nombre del icono para UI (ej: megaphone, newspaper, briefcase)',
  })
  icono?: string | null

  constructor(data?: Partial<CategoriaPublicacion>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || CategoriaPublicacionEstado.ACTIVO
  }
}
