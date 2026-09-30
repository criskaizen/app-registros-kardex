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
import { CategoriaDocumentoEstado } from '../constant'

dotenv.config()

@Check(UtilService.buildStatusCheck(CategoriaDocumentoEstado))
@Entity({ name: 'categorias_documento', schema: process.env.DB_SCHEMA })
export class CategoriaDocumento extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Categoría Documento',
  })
  id: string

  @Column({
    length: 30,
    type: 'varchar',
    unique: true,
    comment:
      'Código único de la categoría (ej: FORMULARIO, NORMATIVA, MANUAL, GUIA)',
  })
  codigo: string

  @Column({
    length: 100,
    type: 'varchar',
    comment: 'Nombre de la categoría (ej: Formularios de Trámite)',
  })
  nombre: string

  @Column({
    length: 255,
    type: 'varchar',
    nullable: true,
    comment: 'Descripción breve de la categoría',
  })
  descripcion?: string | null

  constructor(data?: Partial<CategoriaDocumento>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || CategoriaDocumentoEstado.ACTIVO
  }
}
