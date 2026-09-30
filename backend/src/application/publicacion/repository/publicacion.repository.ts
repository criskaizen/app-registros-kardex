import { Brackets, DataSource } from 'typeorm'
import { Injectable } from '@nestjs/common'
import {
  ActualizarPublicacionDto,
  CrearPublicacionDto,
  FiltrosPublicacionDto,
} from '../dto'
import { Publicacion } from '../entity'
import { Order } from '@/common/constants'
import { CategoriaPublicacion } from '@/application/categoria-publicacion/entity'

@Injectable()
export class PublicacionRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Publicacion)
      .createQueryBuilder('publicacion')
      .leftJoinAndSelect('publicacion.categoria', 'categoria')
      .leftJoinAndSelect('publicacion.imagenes', 'imagen')
      .where({ id })
      .orderBy('imagen.esPortada', 'DESC')
      .addOrderBy('imagen.orden', 'ASC')
      .getOne()
  }

  async buscarPorSlug(slug: string) {
    return await this.dataSource
      .getRepository(Publicacion)
      .createQueryBuilder('publicacion')
      .leftJoinAndSelect('publicacion.categoria', 'categoria')
      .leftJoinAndSelect('publicacion.imagenes', 'imagen')
      .where({ slug })
      .orderBy('imagen.esPortada', 'DESC')
      .addOrderBy('imagen.orden', 'ASC')
      .getOne()
  }

  async slugExistente(slug: string, idExcluido?: string) {
    const query = this.dataSource
      .getRepository(Publicacion)
      .createQueryBuilder('publicacion')
      .where('publicacion.slug = :slug', { slug })

    if (idExcluido) {
      query.andWhere('publicacion.id != :id', { id: idExcluido })
    }

    return await query.getOne()
  }

  async crear(publicacionDto: CrearPublicacionDto, usuarioAuditoria: string) {
    const {
      idCategoria,
      tipoPublicacion,
      titulo,
      slug,
      resumen,
      contenido,
      esDestacado,
      fechaPublicacion,
      fechaVencimiento,
    } = publicacionDto

    const publicacion = new Publicacion()
    publicacion.idCategoria = idCategoria
    publicacion.tipoPublicacion = tipoPublicacion
    publicacion.titulo = titulo
    publicacion.resumen = resumen
    publicacion.contenido = contenido
    publicacion.esDestacado = esDestacado ?? false
    publicacion.slug = slug ?? ''
    if (fechaPublicacion) {
      publicacion.fechaPublicacion = new Date(fechaPublicacion)
    }
    if (fechaVencimiento) {
      publicacion.fechaVencimiento = new Date(fechaVencimiento)
    }
    publicacion.usuarioCreacion = usuarioAuditoria

    return await this.dataSource.getRepository(Publicacion).save(publicacion)
  }

  async actualizar(
    id: string,
    publicacionDto: ActualizarPublicacionDto,
    usuarioAuditoria: string
  ) {
    const { fechaPublicacion, fechaVencimiento, ...resto } = publicacionDto

    const datosActualizar: Partial<Publicacion> = {
      ...resto,
      usuarioModificacion: usuarioAuditoria,
    }

    if (fechaPublicacion) {
      datosActualizar.fechaPublicacion = new Date(fechaPublicacion)
    }
    if (fechaVencimiento) {
      datosActualizar.fechaVencimiento = new Date(fechaVencimiento)
    }

    return await this.dataSource
      .getRepository(Publicacion)
      .update(id, datosActualizar)
  }

  async incrementarVistas(id: string) {
    return await this.dataSource
      .createQueryBuilder()
      .update(Publicacion)
      .set({ vistas: () => 'vistas + 1' })
      .where('id = :id', { id })
      .execute()
  }

  async listar(filtrosDto: FiltrosPublicacionDto) {
    const { limite, saltar, filtro, orden, sentido } = filtrosDto
    const { tipoPublicacion, estado, idCategoria, esDestacado } = filtrosDto

    const query = this.dataSource
      .getRepository(Publicacion)
      .createQueryBuilder('publicacion')
      .leftJoinAndSelect('publicacion.categoria', 'categoria')
      .select([
        'publicacion.id',
        'publicacion.idCategoria',
        'publicacion.tipoPublicacion',
        'publicacion.titulo',
        'publicacion.slug',
        'publicacion.resumen',
        'publicacion.esDestacado',
        'publicacion.fechaPublicacion',
        'publicacion.fechaVencimiento',
        'publicacion.vistas',
        'publicacion.estado',
        'categoria.id',
        'categoria.codigo',
        'categoria.nombre',
        'categoria.color',
        'categoria.icono',
      ])
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'titulo':
        query.addOrderBy('publicacion.titulo', sentido)
        break
      case 'slug':
        query.addOrderBy('publicacion.slug', sentido)
        break
      case 'tipoPublicacion':
        query.addOrderBy('publicacion.tipoPublicacion', sentido)
        break
      case 'fechaPublicacion':
        query.addOrderBy('publicacion.fechaPublicacion', sentido)
        break
      case 'vistas':
        query.addOrderBy('publicacion.vistas', sentido)
        break
      case 'estado':
        query.addOrderBy('publicacion.estado', sentido)
        break
      default:
        query.orderBy('publicacion.fechaPublicacion', Order.DESC)
    }

    if (tipoPublicacion) {
      query.andWhere('publicacion.tipo_publicacion = :tipoPublicacion', {
        tipoPublicacion,
      })
    }
    if (estado) {
      query.andWhere('publicacion._estado = :estado', { estado })
    }
    if (idCategoria) {
      query.andWhere('publicacion.id_categoria = :idCategoria', { idCategoria })
    }
    if (esDestacado) {
      query.andWhere('publicacion.es_destacado = :esDestacado', {
        esDestacado,
      })
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('publicacion.titulo ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('publicacion.resumen ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('publicacion.slug ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async listarDestacadas(limite = 10) {
    return await this.dataSource
      .getRepository(Publicacion)
      .createQueryBuilder('publicacion')
      .leftJoinAndSelect('publicacion.categoria', 'categoria')
      .where('publicacion.es_destacado = true')
      .andWhere('publicacion._estado = :estado', { estado: 'PUBLICADO' })
      .orderBy('publicacion.fecha_publicacion', Order.DESC)
      .take(limite)
      .getMany()
  }

  async listarPublicadas(filtrosDto: FiltrosPublicacionDto) {
    const { limite, saltar, filtro, orden, sentido } = filtrosDto
    const { tipoPublicacion, idCategoria } = filtrosDto

    const query = this.dataSource
      .getRepository(Publicacion)
      .createQueryBuilder('publicacion')
      .leftJoinAndSelect('publicacion.categoria', 'categoria')
      .select([
        'publicacion.id',
        'publicacion.idCategoria',
        'publicacion.tipoPublicacion',
        'publicacion.titulo',
        'publicacion.slug',
        'publicacion.resumen',
        'publicacion.esDestacado',
        'publicacion.fechaPublicacion',
        'publicacion.fechaVencimiento',
        'publicacion.vistas',
        'publicacion.estado',
        'categoria.id',
        'categoria.codigo',
        'categoria.nombre',
        'categoria.color',
        'categoria.icono',
      ])
      .where('publicacion._estado = :estado', { estado: 'PUBLICADO' })
      .andWhere('publicacion.fecha_publicacion <= now()')
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'titulo':
        query.addOrderBy('publicacion.titulo', sentido)
        break
      case 'vistas':
        query.addOrderBy('publicacion.vistas', sentido)
        break
      case 'fechaPublicacion':
        query.addOrderBy('publicacion.fecha_publicacion', sentido)
        break
      default:
        query.orderBy('publicacion.fecha_publicacion', Order.DESC)
    }

    if (tipoPublicacion) {
      query.andWhere('publicacion.tipo_publicacion = :tipoPublicacion', {
        tipoPublicacion,
      })
    }
    if (idCategoria) {
      query.andWhere('publicacion.id_categoria = :idCategoria', { idCategoria })
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('publicacion.titulo ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('publicacion.resumen ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async listarCategoriasUsadas() {
    return await this.dataSource
      .getRepository(CategoriaPublicacion)
      .createQueryBuilder('categoria')
      .innerJoin(
        Publicacion,
        'publicacion',
        'publicacion.id_categoria = categoria.id'
      )
      .select(['categoria.id', 'categoria.codigo', 'categoria.nombre'])
      .groupBy('categoria.id')
      .orderBy('categoria.nombre', Order.ASC)
      .getMany()
  }
}
