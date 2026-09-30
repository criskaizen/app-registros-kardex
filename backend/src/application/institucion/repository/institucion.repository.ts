import { DataSource } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InstitucionDto } from '../dto'
import { Institucion } from '../entity'
import { Order } from '@/common/constants'

@Injectable()
export class InstitucionRepository {
  constructor(private dataSource: DataSource) {}

  /**
   * Devuelve el registro de la institución. Al ser una tabla singleton,
   * se espera como máximo una fila activa.
   */
  async buscarUnica() {
    return await this.dataSource
      .getRepository(Institucion)
      .createQueryBuilder('institucion')
      .where('institucion._estado = :estado', { estado: 'ACTIVO' })
      .orderBy('institucion.id', Order.ASC)
      .getOne()
  }

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Institucion)
      .createQueryBuilder('institucion')
      .where({ id })
      .getOne()
  }

  async contar() {
    return await this.dataSource.getRepository(Institucion).count()
  }

  async crear(institucionDto: InstitucionDto, usuarioAuditoria: string) {
    const {
      nombre,
      sigla,
      descripcion,
      mision,
      vision,
      objetivos,
      logoUrl,
      logoSecundarioUrl,
      direccionPrincipal,
      ciudad,
      telefonos,
      correoContacto,
      correoSoporte,
      horarioAtencion,
      mapaEmbedUrl,
      redesSociales,
      portalWeb,
    } = institucionDto

    const institucion = new Institucion()
    institucion.nombre = nombre
    institucion.sigla = sigla
    institucion.descripcion = descripcion
    institucion.mision = mision
    institucion.vision = vision
    institucion.objetivos = objetivos
    institucion.logoUrl = logoUrl
    institucion.logoSecundarioUrl = logoSecundarioUrl
    institucion.direccionPrincipal = direccionPrincipal
    institucion.ciudad = ciudad
    institucion.telefonos = telefonos
    institucion.correoContacto = correoContacto
    institucion.correoSoporte = correoSoporte
    institucion.horarioAtencion = horarioAtencion
    institucion.mapaEmbedUrl = mapaEmbedUrl
    institucion.redesSociales = redesSociales ?? {}
    institucion.portalWeb = portalWeb
    institucion.usuarioCreacion = usuarioAuditoria

    return await this.dataSource.getRepository(Institucion).save(institucion)
  }

  async actualizar(
    id: string,
    institucionDto: Partial<InstitucionDto>,
    usuarioAuditoria: string
  ) {
    return await this.dataSource.getRepository(Institucion).update(id, {
      ...institucionDto,
      usuarioModificacion: usuarioAuditoria,
    })
  }
}
