import { Brackets, DataSource } from 'typeorm'
import { Injectable } from '@nestjs/common'
import {
  ActualizarDocumentoDto,
  CrearDocumentoDto,
  FiltrosDocumentoDto,
} from '../dto'
import { Documento } from '../entity'
import { DocumentoEstado } from '../constant'
import { Order } from '@/common/constants'

@Injectable()
export class DocumentoRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Documento)
      .createQueryBuilder('documento')
      .leftJoinAndSelect('documento.categoria', 'categoria')
      .where({ id })
      .getOne()
  }

  /**
   * Busca un documento por la combinación de código y versión.
   * Si no se envía código, no hay coincidencia posible.
   */
  async buscarPorCodigoYVersion(codigoDocumento: string, version?: string) {
    if (!codigoDocumento) {
      return null
    }
    const query = this.dataSource
      .getRepository(Documento)
      .createQueryBuilder('documento')
      .where('documento.codigo_documento = :codigoDocumento', {
        codigoDocumento,
      })

    if (version) {
      query.andWhere('documento.version = :version', { version })
    }

    return await query.getOne()
  }

  async crear(
    documentoDto: CrearDocumentoDto,
    archivo: Express.Multer.File,
    urlArchivo: string,
    usuarioAuditoria: string
  ) {
    const {
      idCategoria,
      codigoDocumento,
      titulo,
      descripcion,
      version,
      esDestacado,
      fechaPublicacion,
    } = documentoDto

    const documento = new Documento()
    documento.idCategoria = idCategoria
    documento.codigoDocumento = codigoDocumento
    documento.titulo = titulo
    documento.descripcion = descripcion
    documento.version = version
    documento.esDestacado = esDestacado ?? false
    // Se persiste la ruta relativa al directorio de almacenamiento,
    // no la ruta absoluta que devuelve multer.
    documento.urlArchivo = urlArchivo
    documento.nombreArchivoOriginal = archivo.originalname
    documento.mimeType = archivo.mimetype
    documento.tamanoBytes = archivo.size
    if (fechaPublicacion) {
      documento.fechaPublicacion = new Date(fechaPublicacion)
    }
    documento.usuarioCreacion = usuarioAuditoria

    return await this.dataSource.getRepository(Documento).save(documento)
  }

  async actualizar(
    id: string,
    documentoDto: ActualizarDocumentoDto,
    usuarioAuditoria: string
  ) {
    const { fechaPublicacion, ...resto } = documentoDto

    const datosActualizar: Partial<Documento> = {
      ...resto,
      usuarioModificacion: usuarioAuditoria,
    }

    if (fechaPublicacion) {
      datosActualizar.fechaPublicacion = new Date(fechaPublicacion)
    }

    return await this.dataSource
      .getRepository(Documento)
      .update(id, datosActualizar)
  }

  async incrementarDescargas(id: string) {
    return await this.dataSource
      .createQueryBuilder()
      .update(Documento)
      .set({ nroDescargas: () => 'nro_descargas + 1' })
      .where('id = :id', { id })
      .execute()
  }

  async listar(filtrosDto: FiltrosDocumentoDto) {
    const { limite, saltar, filtro, orden, sentido } = filtrosDto
    const { idCategoria, codigoDocumento, estado, esDestacado } = filtrosDto

    const query = this.dataSource
      .getRepository(Documento)
      .createQueryBuilder('documento')
      .leftJoinAndSelect('documento.categoria', 'categoria')
      .select([
        'documento.id',
        'documento.idCategoria',
        'documento.codigoDocumento',
        'documento.titulo',
        'documento.descripcion',
        'documento.version',
        'documento.urlArchivo',
        'documento.nombreArchivoOriginal',
        'documento.mimeType',
        'documento.tamanoBytes',
        'documento.nroDescargas',
        'documento.esDestacado',
        'documento.fechaPublicacion',
        'documento.estado',
        'categoria.id',
        'categoria.codigo',
        'categoria.nombre',
      ])
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'titulo':
        query.addOrderBy('documento.titulo', sentido)
        break
      case 'codigoDocumento':
        query.addOrderBy('documento.codigo_documento', sentido)
        break
      case 'version':
        query.addOrderBy('documento.version', sentido)
        break
      case 'nroDescargas':
        query.addOrderBy('documento.nro_descargas', sentido)
        break
      case 'fechaPublicacion':
        query.addOrderBy('documento.fecha_publicacion', sentido)
        break
      case 'estado':
        query.addOrderBy('documento._estado', sentido)
        break
      default:
        query.orderBy('documento.fecha_publicacion', Order.DESC)
    }

    if (idCategoria) {
      query.andWhere('documento.id_categoria = :idCategoria', { idCategoria })
    }
    if (codigoDocumento) {
      query.andWhere('documento.codigo_documento = :codigoDocumento', {
        codigoDocumento,
      })
    }
    if (estado) {
      query.andWhere('documento._estado = :estado', { estado })
    }
    if (esDestacado) {
      query.andWhere('documento.es_destacado = :esDestacado', {
        esDestacado,
      })
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('documento.titulo ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('documento.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('documento.codigo_documento ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async listarDestacados(limite = 10) {
    return await this.dataSource
      .getRepository(Documento)
      .createQueryBuilder('documento')
      .leftJoinAndSelect('documento.categoria', 'categoria')
      .where('documento.es_destacado = true')
      .andWhere('documento._estado = :estado', {
        estado: DocumentoEstado.ACTIVO,
      })
      .orderBy('documento.nro_descargas', Order.DESC)
      .take(limite)
      .getMany()
  }

  /**
   * Devuelve todas las versiones de un mismo documento, de la más reciente a la más antigua.
   */
  async listarVersiones(codigoDocumento: string) {
    return await this.dataSource
      .getRepository(Documento)
      .createQueryBuilder('documento')
      .where('documento.codigo_documento = :codigoDocumento', {
        codigoDocumento,
      })
      .andWhere('documento._estado = :estado', {
        estado: DocumentoEstado.ACTIVO,
      })
      .orderBy('documento.fecha_publicacion', Order.DESC)
      .getMany()
  }
}
