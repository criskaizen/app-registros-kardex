import { Brackets, DataSource } from 'typeorm'
import { Injectable } from '@nestjs/common'
import {
  ActualizarCategoriaPublicacionDto,
  CrearCategoriaPublicacionDto,
} from '../dto'
import { CategoriaPublicacion } from '../entity'
import { CategoriaPublicacionEstado } from '../constant'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

@Injectable()
export class CategoriaPublicacionRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(CategoriaPublicacion)
      .createQueryBuilder('categoria')
      .where({ id })
      .getOne()
  }

  async buscarPorCodigo(codigo: string) {
    return await this.dataSource
      .getRepository(CategoriaPublicacion)
      .findOne({ where: { codigo } })
  }

  async crear(
    categoriaDto: CrearCategoriaPublicacionDto,
    usuarioAuditoria: string
  ) {
    const { codigo, nombre, descripcion, color, icono } = categoriaDto

    const categoria = new CategoriaPublicacion()
    categoria.codigo = codigo
    categoria.nombre = nombre
    categoria.descripcion = descripcion
    categoria.color = color
    categoria.icono = icono
    categoria.usuarioCreacion = usuarioAuditoria

    return await this.dataSource
      .getRepository(CategoriaPublicacion)
      .save(categoria)
  }

  async actualizar(
    id: string,
    categoriaDto: ActualizarCategoriaPublicacionDto,
    usuarioAuditoria: string
  ) {
    const datosActualizar = new CategoriaPublicacion({
      ...categoriaDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource
      .getRepository(CategoriaPublicacion)
      .update(id, datosActualizar)
  }

  async listar(paginacionQueryDto: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQueryDto
    const query = this.dataSource
      .getRepository(CategoriaPublicacion)
      .createQueryBuilder('categoria')
      .select([
        'categoria.id',
        'categoria.codigo',
        'categoria.nombre',
        'categoria.descripcion',
        'categoria.color',
        'categoria.icono',
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
      .getRepository(CategoriaPublicacion)
      .createQueryBuilder('categoria')
      .select([
        'categoria.id',
        'categoria.codigo',
        'categoria.nombre',
        'categoria.descripcion',
        'categoria.color',
        'categoria.icono',
      ])
      .where('categoria.estado = :estado', {
        estado: CategoriaPublicacionEstado.ACTIVO,
      })
      .orderBy('categoria.nombre', 'ASC')
      .getMany()
  }
}
