import { BaseService } from '@/common/base/base-service'
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PublicacionRepository } from '../repository'
import {
  ActualizarPublicacionDto,
  CrearPublicacionDto,
  FiltrosPublicacionDto,
} from '../dto'
import { Messages } from '@/common/constants/response-messages'
import { CategoriaPublicacionRepository } from '@/application/categoria-publicacion/repository'
import { PublicacionEstado } from '../constant'

@Injectable()
export class PublicacionService extends BaseService {
  constructor(
    @Inject(PublicacionRepository)
    private publicacionRepositorio: PublicacionRepository,
    @Inject(CategoriaPublicacionRepository)
    private categoriaRepositorio: CategoriaPublicacionRepository
  ) {
    super()
  }

  /**
   * Genera un slug a partir de un texto: sin acentos, minúsculas,
   * separadores por guion y sin caracteres especiales.
   */
  private generarSlug(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 300)
  }

  /**
   * Valida que la categoría exista y que su código coincida con el tipo de publicación
   */
  private async validarCategoria(idCategoria: string, tipoPublicacion: string) {
    const categoria = await this.categoriaRepositorio.buscarPorId(idCategoria)
    if (!categoria) {
      throw new NotFoundException(Messages.CATEGORY_NOT_FOUND)
    }
    if (tipoPublicacion && categoria.codigo !== tipoPublicacion) {
      throw new ConflictException(Messages.TYPE_CATEGORY_MISMATCH)
    }
    return categoria
  }

  async crear(publicacionDto: CrearPublicacionDto, usuarioAuditoria: string) {
    await this.validarCategoria(
      publicacionDto.idCategoria,
      publicacionDto.tipoPublicacion
    )

    const slug =
      publicacionDto.slug?.trim() || this.generarSlug(publicacionDto.titulo)

    if (!slug) {
      throw new ConflictException(Messages.INVALID_SLUG)
    }

    const slugExistente = await this.publicacionRepositorio.slugExistente(slug)
    if (slugExistente) {
      throw new ConflictException(Messages.REPEATED_SLUG)
    }

    return await this.publicacionRepositorio.crear(
      { ...publicacionDto, slug },
      usuarioAuditoria
    )
  }

  async listar(filtrosDto: FiltrosPublicacionDto) {
    return await this.publicacionRepositorio.listar(filtrosDto)
  }

  async listarPublicadas(filtrosDto: FiltrosPublicacionDto) {
    return await this.publicacionRepositorio.listarPublicadas(filtrosDto)
  }

  async listarDestacadas(limite?: number) {
    return await this.publicacionRepositorio.listarDestacadas(limite)
  }

  async buscarPorId(id: string) {
    const publicacion = await this.publicacionRepositorio.buscarPorId(id)
    if (!publicacion) {
      throw new NotFoundException(Messages.PUBLICACION_NOT_FOUND)
    }
    return publicacion
  }

  async buscarPorSlug(slug: string) {
    const publicacion = await this.publicacionRepositorio.buscarPorSlug(slug)
    if (!publicacion) {
      throw new NotFoundException(Messages.PUBLICACION_NOT_FOUND)
    }
    return publicacion
  }

  async actualizarDatos(
    id: string,
    publicacionDto: ActualizarPublicacionDto,
    usuarioAuditoria: string
  ) {
    const publicacion = await this.publicacionRepositorio.buscarPorId(id)
    if (!publicacion) {
      throw new NotFoundException(Messages.PUBLICACION_NOT_FOUND)
    }

    const idCategoria = publicacionDto.idCategoria ?? publicacion.idCategoria
    const tipoPublicacion =
      publicacionDto.tipoPublicacion ?? publicacion.tipoPublicacion

    await this.validarCategoria(idCategoria, tipoPublicacion)

    if (publicacionDto.slug?.trim()) {
      const slug = publicacionDto.slug.trim()
      const slugExistente = await this.publicacionRepositorio.slugExistente(
        slug,
        id
      )
      if (slugExistente) {
        throw new ConflictException(Messages.REPEATED_SLUG)
      }
      publicacionDto.slug = slug
    }

    await this.publicacionRepositorio.actualizar(
      id,
      publicacionDto,
      usuarioAuditoria
    )
    return { id }
  }

  async registrarVista(id: string) {
    const publicacion = await this.publicacionRepositorio.buscarPorId(id)
    if (!publicacion) {
      throw new NotFoundException(Messages.PUBLICACION_NOT_FOUND)
    }
    await this.publicacionRepositorio.incrementarVistas(id)
    return { id, vistas: publicacion.vistas + 1 }
  }

  async publicar(id: string, usuarioAuditoria: string) {
    return await this.cambiarEstado(
      id,
      PublicacionEstado.PUBLICADO,
      usuarioAuditoria
    )
  }

  async pasarABorrador(id: string, usuarioAuditoria: string) {
    return await this.cambiarEstado(
      id,
      PublicacionEstado.BORRADOR,
      usuarioAuditoria
    )
  }

  async inactivar(id: string, usuarioAuditoria: string) {
    return await this.cambiarEstado(
      id,
      PublicacionEstado.INACTIVO,
      usuarioAuditoria
    )
  }

  async activar(id: string, usuarioAuditoria: string) {
    return await this.publicar(id, usuarioAuditoria)
  }

  private async cambiarEstado(
    id: string,
    estado: string,
    usuarioAuditoria: string
  ) {
    const publicacion = await this.publicacionRepositorio.buscarPorId(id)
    if (!publicacion) {
      throw new NotFoundException(Messages.PUBLICACION_NOT_FOUND)
    }
    await this.publicacionRepositorio.actualizar(
      id,
      { estado },
      usuarioAuditoria
    )
    return { id, estado }
  }
}
