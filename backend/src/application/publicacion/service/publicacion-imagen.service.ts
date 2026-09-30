import { BaseService } from '@/common/base/base-service'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PublicacionImagenRepository } from '../repository'
import { PublicacionRepository } from '../repository'
import {
  ActualizarPublicacionImagenDto,
  CrearPublicacionImagenDto,
  FiltrosPublicacionImagenDto,
} from '../dto'
import { Messages } from '@/common/constants/response-messages'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { StorageService } from '@/common/lib/storage.service'
import { PublicacionImagenEstado } from '../constant'

@Injectable()
export class PublicacionImagenService extends BaseService {
  constructor(
    @Inject(PublicacionImagenRepository)
    private imagenRepositorio: PublicacionImagenRepository,
    @Inject(PublicacionRepository)
    private publicacionRepositorio: PublicacionRepository
  ) {
    super()
  }

  /**
   * Convierte la ruta absoluta que devuelve multer en una ruta relativa
   * al directorio raíz de almacenamiento, que es lo que se persiste en la BD.
   */
  private rutaRelativa(rutaAbsoluta: string): string {
    const raiz = StorageService.rootPath.replace(/[/\\]+$/, '')
    const normalizada = rutaAbsoluta.replace(/\\/g, '/')
    const raizNormalizada = raiz.replace(/\\/g, '/')
    return normalizada.startsWith(raizNormalizada)
      ? normalizada.slice(raizNormalizada.length).replace(/^\/+/, '')
      : normalizada
  }

  /**
   * Valida que la publicación exista
   */
  private async validarPublicacion(idPublicacion: string) {
    const publicacion =
      await this.publicacionRepositorio.buscarPorId(idPublicacion)
    if (!publicacion) {
      throw new NotFoundException(Messages.PUBLICACION_NOT_FOUND)
    }
    return publicacion
  }

  async crear(
    imagenDto: CrearPublicacionImagenDto,
    archivo: Express.Multer.File,
    usuarioAuditoria: string
  ) {
    if (!archivo) {
      throw new BadRequestException(Messages.IMAGE_FILE_REQUIRED)
    }

    await this.validarPublicacion(imagenDto.idPublicacion)

    if (imagenDto.esPortada) {
      await this.imagenRepositorio.limpiarPortada(imagenDto.idPublicacion)
    }

    const urlArchivo = this.rutaRelativa(archivo.path)

    const imagen = await this.imagenRepositorio.crear(
      imagenDto,
      archivo,
      urlArchivo,
      usuarioAuditoria
    )

    // Si es la primera imagen de la publicación, se vuelve portada automáticamente
    await this.imagenRepositorio.asignarPortadaSiNoExiste(
      imagenDto.idPublicacion
    )

    return {
      id: imagen.id,
      urlArchivo,
    }
  }

  async listarPorPublicacion(
    idPublicacion: string,
    paginacionQueryDto?: PaginacionQueryDto
  ) {
    await this.validarPublicacion(idPublicacion)

    if (!paginacionQueryDto) {
      const imagenes =
        await this.imagenRepositorio.listarTodasPorPublicacion(idPublicacion)
      return [imagenes, imagenes.length] as [typeof imagenes, number]
    }

    return await this.imagenRepositorio.listarPorPublicacion(
      idPublicacion,
      paginacionQueryDto
    )
  }

  async listarDestacadas(filtrosDto: FiltrosPublicacionImagenDto) {
    return await this.imagenRepositorio.listarDestacadas(filtrosDto)
  }

  async buscarPorId(id: string) {
    const imagen = await this.imagenRepositorio.buscarPorId(id)
    if (!imagen) {
      throw new NotFoundException(Messages.IMAGE_NOT_FOUND)
    }
    return imagen
  }

  async actualizarDatos(
    id: string,
    imagenDto: ActualizarPublicacionImagenDto,
    usuarioAuditoria: string
  ) {
    const imagen = await this.imagenRepositorio.buscarPorId(id)
    if (!imagen) {
      throw new NotFoundException(Messages.IMAGE_NOT_FOUND)
    }

    if (imagenDto.esPortada) {
      // Desmarca la portada actual de la publicación antes de reasignar
      await this.imagenRepositorio.limpiarPortada(imagen.idPublicacion, id)
    }

    await this.imagenRepositorio.actualizar(id, imagenDto, usuarioAuditoria)
    return { id }
  }

  async marcarPortada(id: string, usuarioAuditoria: string) {
    const imagen = await this.imagenRepositorio.buscarPorId(id)
    if (!imagen) {
      throw new NotFoundException(Messages.IMAGE_NOT_FOUND)
    }

    await this.imagenRepositorio.limpiarPortada(imagen.idPublicacion, id)
    await this.imagenRepositorio.actualizar(
      id,
      { esPortada: true },
      usuarioAuditoria
    )

    return { id, esPortada: true }
  }

  async inactivar(id: string, usuarioAuditoria: string) {
    const imagen = await this.imagenRepositorio.buscarPorId(id)
    if (!imagen) {
      throw new NotFoundException(Messages.IMAGE_NOT_FOUND)
    }

    await this.imagenRepositorio.inactivar(id, usuarioAuditoria)

    // Si era la portada, se promueve la siguiente imagen disponible
    if (imagen.esPortada) {
      await this.imagenRepositorio.asignarPortadaSiNoExiste(
        imagen.idPublicacion
      )
    }

    return {
      id,
      estado: PublicacionImagenEstado.INACTIVO,
    }
  }

  async reactivar(id: string, usuarioAuditoria: string) {
    const imagen = await this.imagenRepositorio.buscarPorId(id)
    if (!imagen) {
      throw new NotFoundException(Messages.IMAGE_NOT_FOUND)
    }

    await this.imagenRepositorio.reactivar(id, usuarioAuditoria)
    return {
      id,
      estado: PublicacionImagenEstado.ACTIVO,
    }
  }

  async eliminar(id: string) {
    const imagen = await this.imagenRepositorio.buscarPorId(id)
    if (!imagen) {
      throw new NotFoundException(Messages.IMAGE_NOT_FOUND)
    }

    // Elimina el registro y el archivo físico
    await this.imagenRepositorio.eliminar(id)
    try {
      StorageService.eliminarArchivo(imagen.urlArchivo)
    } catch {
      // Si el archivo ya no existe en disco, no bloquea la eliminación
    }

    return { id }
  }
}
