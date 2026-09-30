import { Brackets, DataSource } from 'typeorm'
import { Injectable } from '@nestjs/common'
import {
  ActualizarCategoriaDocumentoDto,
  CrearCategoriaDocumentoDto,
} from '../dto'
import { CategoriaDocumento } from '../entity'
import { CategoriaDocumentoEstado } from '../constant'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

@Injectable()
export class CategoriaDocumentoRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(CategoriaDocumento)
      .createQueryBuilder('categoria')
      .where({ id })
      .getOne()
  }

  async buscarPorCodigo(codigo: string) {
    return await this.dataSource
      .getRepository(CategoriaDocumento)
      .findOne({ where: { codigo } })
  }

  async crear(
    categoriaDto: CrearCategoriaDocumentoDto,
    usuarioAuditoria: string
  ) {
    const { codigo, nombre, descripcion } = categoriaDto

    const categoria = new CategoriaDocumento()
    categoria.codigo = codigo
    categoria.nombre = nombre
    categoria.descripcion = descripcion
    categoria.usuarioCreacion = usuarioAuditoria

    return await this.dataSource
      .getRepository(CategoriaDocumento)
      .save(categoria)
  }

  async actualizar(
    id: string,
    categoriaDto: ActualizarCategoriaDocumentoDto,
    usuarioAuditoria: string
  ) {
    const datosActualizar = new CategoriaDocumento({
      ...categoriaDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource
      .getRepository(CategoriaDocumento)
      .update(id, datosActualizar)
  }

  async listar(paginacionQueryDto: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQueryDto
    const query = this.dataSource
      .getRepository(CategoriaDocumento)
      .createQueryBuilder('categoria')
      .select([
        'categoria.id',
        'categoria.codigo',
        'categoria.nombre',
        'categoria.descripcion',
        'categoria.estado',
      ])
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'codigo':
        query.addOrderBy('categoria.codigo', sentido)
        break
      case 'nombre':
        query.addOrderBy('categoria.nombre', sentido)
        break
      case 'descripcion':
        query.addOrderBy('categoria.descripcion', sentido)
        break
      case 'estado':
        query.addOrderBy('categoria.estado', sentido)
        break
      default:
        query.orderBy('categoria.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('categoria.codigo ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('categoria.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('categoria.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async listarActivos() {
    return await this.dataSource
      .getRepository(CategoriaDocumento)
      .createQueryBuilder('categoria')
      .select([
        'categoria.id',
        'categoria.codigo',
        'categoria.nombre',
        'categoria.descripcion',
      ])
      .where('categoria._estado = :estado', {
        estado: CategoriaDocumentoEstado.ACTIVO,
      })
      .orderBy('categoria.nombre', 'ASC')
      .getMany()
  }
}
