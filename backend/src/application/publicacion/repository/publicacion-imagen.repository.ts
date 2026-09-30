import { Brackets, DataSource } from 'typeorm'
import { Injectable } from '@nestjs/common'
import {
  ActualizarPublicacionImagenDto,
  CrearPublicacionImagenDto,
  FiltrosPublicacionImagenDto,
} from '../dto'
import { PublicacionImagen } from '../entity'
import { PublicacionImagenEstado } from '../constant'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

@Injectable()
export class PublicacionImagenRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(PublicacionImagen)
      .createQueryBuilder('imagen')
      .where({ id })
      .getOne()
  }

  /**
   * Devuelve el siguiente orden disponible para una publicación
   */
  async siguienteOrden(idPublicacion: string) {
    const ultima = await this.dataSource
      .getRepository(PublicacionImagen)
      .createQueryBuilder('imagen')
      .select('MAX(imagen.orden)', 'maximo')
      .where('imagen.id_publicacion = :idPublicacion', { idPublicacion })
      .andWhere('imagen._estado = :estado', {
        estado: PublicacionImagenEstado.ACTIVO,
      })
      .getRawOne()

    return (ultima?.maximo ? Number(ultima.maximo) : 0) + 1
  }

  /**
   * Cuenta las imágenes activas de una publicación
   */
  async contarPorPublicacion(idPublicacion: string) {
    return await this.dataSource
      .getRepository(PublicacionImagen)
      .createQueryBuilder('imagen')
      .where('imagen.id_publicacion = :idPublicacion', { idPublicacion })
      .andWhere('imagen._estado = :estado', {
        estado: PublicacionImagenEstado.ACTIVO,
      })
      .getCount()
  }

  /**
   * Desmarca la portada actual de la publicación, si existe
   */
  async limpiarPortada(idPublicacion: string, excluirId?: string) {
    const query = this.dataSource
      .getRepository(PublicacionImagen)
      .createQueryBuilder()
      .update(PublicacionImagen)
      .set({ esPortada: false })
      .where('id_publicacion = :idPublicacion', { idPublicacion })
      .andWhere('es_portada = true')

    if (excluirId) {
      query.andWhere('id != :excluirId', { excluirId })
    }

    return await query.execute()
  }

  /**
   * Marca la primera imagen de la publicación como portada,
   * solo si la publicación aún no tiene una.
   */
  async asignarPortadaSiNoExiste(idPublicacion: string) {
    const existePortada = await this.dataSource
      .getRepository(PublicacionImagen)
      .createQueryBuilder('imagen')
      .where('imagen.id_publicacion = :idPublicacion', { idPublicacion })
      .andWhere('imagen.es_portada = true')
      .andWhere('imagen._estado = :estado', {
        estado: PublicacionImagenEstado.ACTIVO,
      })
      .getCount()

    if (existePortada > 0) {
      return
    }

    const primera = await this.dataSource
      .getRepository(PublicacionImagen)
      .createQueryBuilder('imagen')
      .where('imagen.id_publicacion = :idPublicacion', { idPublicacion })
      .andWhere('imagen._estado = :estado', {
        estado: PublicacionImagenEstado.ACTIVO,
      })
      .orderBy('imagen.orden', 'ASC')
      .getOne()

    if (primera) {
      await this.dataSource
        .getRepository(PublicacionImagen)
        .update(primera.id, { esPortada: true })
    }
  }

  async crear(
    imagenDto: CrearPublicacionImagenDto,
    archivo: Express.Multer.File,
    urlArchivo: string,
    usuarioAuditoria: string
  ) {
    const { idPublicacion, titulo, textoAlternativo, orden, esPortada } =
      imagenDto

    const imagen = new PublicacionImagen()
    imagen.idPublicacion = idPublicacion
    imagen.titulo = titulo
    imagen.textoAlternativo = textoAlternativo
    // Se persiste la ruta relativa al directorio de almacenamiento,
    // no la ruta absoluta que devuelve multer.
    imagen.urlArchivo = urlArchivo
    imagen.nombreArchivoOriginal = archivo.originalname
    imagen.mimeType = archivo.mimetype
    imagen.tamanoBytes = archivo.size
    imagen.esPortada = esPortada ?? false
    imagen.orden = orden ?? (await this.siguienteOrden(idPublicacion))
    imagen.usuarioCreacion = usuarioAuditoria

    return await this.dataSource.getRepository(PublicacionImagen).save(imagen)
  }

  async actualizar(
    id: string,
    imagenDto: ActualizarPublicacionImagenDto,
    usuarioAuditoria: string
  ) {
    const datosActualizar = new PublicacionImagen({
      ...imagenDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource
      .getRepository(PublicacionImagen)
      .update(id, datosActualizar)
  }

  async actualizarRutaArchivo(id: string, rutaRelativa: string) {
    return await this.dataSource
      .getRepository(PublicacionImagen)
      .update(id, { urlArchivo: rutaRelativa })
  }

  async inactivar(id: string, usuarioAuditoria: string) {
    return await this.dataSource.getRepository(PublicacionImagen).update(id, {
      estado: PublicacionImagenEstado.INACTIVO,
      esPortada: false,
      usuarioModificacion: usuarioAuditoria,
    })
  }

  async reactivar(id: string, usuarioAuditoria: string) {
    return await this.dataSource.getRepository(PublicacionImagen).update(id, {
      estado: PublicacionImagenEstado.ACTIVO,
      usuarioModificacion: usuarioAuditoria,
    })
  }

  async eliminar(id: string) {
    return await this.dataSource.getRepository(PublicacionImagen).delete(id)
  }

  async listarPorPublicacion(
    idPublicacion: string,
    paginacionQueryDto?: PaginacionQueryDto
  ) {
    const query = this.dataSource
      .getRepository(PublicacionImagen)
      .createQueryBuilder('imagen')
      .where('imagen.id_publicacion = :idPublicacion', { idPublicacion })
      .andWhere('imagen._estado = :estado', {
        estado: PublicacionImagenEstado.ACTIVO,
      })
      .orderBy('imagen.es_portada', 'DESC')
      .addOrderBy('imagen.orden', 'ASC')

    if (paginacionQueryDto) {
      const { limite, saltar, orden, sentido, filtro } = paginacionQueryDto
      query.take(limite).skip(saltar)

      switch (orden) {
        case 'orden':
          query.addOrderBy('imagen.orden', sentido)
          break
        case 'titulo':
          query.addOrderBy('imagen.titulo', sentido)
          break
        default:
          break
      }

      if (filtro) {
        query.andWhere(
          new Brackets((qb) => {
            qb.orWhere('imagen.titulo ilike :filtro', {
              filtro: `%${filtro}%`,
            })
            qb.orWhere('imagen.texto_alternativo ilike :filtro', {
              filtro: `%${filtro}%`,
            })
            qb.orWhere('imagen.nombre_archivo_original ilike :filtro', {
              filtro: `%${filtro}%`,
            })
          })
        )
      }
    }

    return await query.getManyAndCount()
  }

  async listarTodasPorPublicacion(idPublicacion: string) {
    return await this.dataSource
      .getRepository(PublicacionImagen)
      .createQueryBuilder('imagen')
      .where('imagen.id_publicacion = :idPublicacion', { idPublicacion })
      .orderBy('imagen.es_portada', 'DESC')
      .addOrderBy('imagen.orden', 'ASC')
      .getMany()
  }

  async listarDestacadas(filtrosDto: FiltrosPublicacionImagenDto) {
    const { limite, saltar, filtro } = filtrosDto
    const query = this.dataSource
      .getRepository(PublicacionImagen)
      .createQueryBuilder('imagen')
      .leftJoinAndSelect('imagen.publicacion', 'publicacion')
      .where('imagen.es_portada = true')
      .andWhere('imagen._estado = :estado', {
        estado: PublicacionImagenEstado.ACTIVO,
      })
      .andWhere('publicacion._estado = :estadoPublicacion', {
        estadoPublicacion: 'PUBLICADO',
      })
      .orderBy('imagen.orden', 'ASC')
      .take(limite)
      .skip(saltar)

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('imagen.titulo ilike :filtro', { filtro: `%${filtro}%` })
          qb.orWhere('imagen.texto_alternativo ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }
}
