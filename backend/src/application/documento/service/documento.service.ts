import { BaseService } from '@/common/base/base-service'
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { DocumentoRepository } from '../repository'
import {
  ActualizarDocumentoDto,
  CrearDocumentoDto,
  FiltrosDocumentoDto,
} from '../dto'
import { Messages } from '@/common/constants/response-messages'
import { StorageService } from '@/common/lib/storage.service'
import { CategoriaDocumentoRepository } from '@/application/categoria-documento/repository'
import { DocumentoEstado } from '../constant'

@Injectable()
export class DocumentoService extends BaseService {
  constructor(
    @Inject(DocumentoRepository)
    private documentoRepositorio: DocumentoRepository,
    @Inject(CategoriaDocumentoRepository)
    private categoriaRepositorio: CategoriaDocumentoRepository
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

  private async validarCategoria(idCategoria: string) {
    const categoria = await this.categoriaRepositorio.buscarPorId(idCategoria)
    if (!categoria) {
      throw new NotFoundException(Messages.CATEGORY_DOCUMENT_NOT_FOUND)
    }
    return categoria
  }

  async crear(
    documentoDto: CrearDocumentoDto,
    archivo: Express.Multer.File,
    usuarioAuditoria: string
  ) {
    if (!archivo) {
      throw new BadRequestException(Messages.DOCUMENT_FILE_REQUIRED)
    }

    await this.validarCategoria(documentoDto.idCategoria)

    // Valida que no exista ya un documento con el mismo código y versión
    if (documentoDto.codigoDocumento) {
      const duplicado = await this.documentoRepositorio.buscarPorCodigoYVersion(
        documentoDto.codigoDocumento,
        documentoDto.version
      )
      if (duplicado) {
        throw new ConflictException(Messages.REPEATED_DOCUMENT_VERSION)
      }
    }

    const urlArchivo = this.rutaRelativa(archivo.path)

    const documento = await this.documentoRepositorio.crear(
      documentoDto,
      archivo,
      urlArchivo,
      usuarioAuditoria
    )

    return { id: documento.id, urlArchivo }
  }

  async listar(filtrosDto: FiltrosDocumentoDto) {
    return await this.documentoRepositorio.listar(filtrosDto)
  }

  async listarDestacados(limite?: number) {
    return await this.documentoRepositorio.listarDestacados(limite)
  }

  async listarVersiones(codigoDocumento: string) {
    return await this.documentoRepositorio.listarVersiones(codigoDocumento)
  }

  async buscarPorId(id: string) {
    const documento = await this.documentoRepositorio.buscarPorId(id)
    if (!documento) {
      throw new NotFoundException(Messages.DOCUMENT_NOT_FOUND)
    }
    return documento
  }

  async actualizarDatos(
    id: string,
    documentoDto: ActualizarDocumentoDto,
    usuarioAuditoria: string
  ) {
    const documento = await this.documentoRepositorio.buscarPorId(id)
    if (!documento) {
      throw new NotFoundException(Messages.DOCUMENT_NOT_FOUND)
    }

    if (documentoDto.idCategoria) {
      await this.validarCategoria(documentoDto.idCategoria)
    }

    // Revalida la combinación código + versión si cambió alguno de los dos
    const codigo = documentoDto.codigoDocumento ?? documento.codigoDocumento
    const version = documentoDto.version ?? documento.version ?? undefined
    if (
      codigo &&
      (codigo !== documento.codigoDocumento || version !== documento.version)
    ) {
      const duplicado = await this.documentoRepositorio.buscarPorCodigoYVersion(
        codigo,
        version
      )
      if (duplicado && duplicado.id !== id) {
        throw new ConflictException(Messages.REPEATED_DOCUMENT_VERSION)
      }
    }

    await this.documentoRepositorio.actualizar(
      id,
      documentoDto,
      usuarioAuditoria
    )
    return { id }
  }

  /**
   * Registra una descarga. Es un endpoint separado del que sirve el archivo,
   * para que el frontend pueda contabilizar la descarga de forma explícita.
   */
  async registrarDescarga(id: string) {
    const documento = await this.documentoRepositorio.buscarPorId(id)
    if (!documento) {
      throw new NotFoundException(Messages.DOCUMENT_NOT_FOUND)
    }
    if (documento.estado !== DocumentoEstado.ACTIVO) {
      throw new ConflictException(Messages.DOCUMENT_NOT_AVAILABLE)
    }
    await this.documentoRepositorio.incrementarDescargas(id)
    return { id, nroDescargas: documento.nroDescargas + 1 }
  }

  async activar(id: string, usuarioAuditoria: string) {
    return await this.cambiarEstado(
      id,
      DocumentoEstado.ACTIVO,
      usuarioAuditoria
    )
  }

  async inactivar(id: string, usuarioAuditoria: string) {
    return await this.cambiarEstado(
      id,
      DocumentoEstado.INACTIVO,
      usuarioAuditoria
    )
  }

  /**
   * Inactiva el documento y elimina el archivo físico del almacenamiento.
   * El registro se conserva para mantener la trazabilidad de las descargas.
   */
  async eliminar(id: string, usuarioAuditoria: string) {
    const documento = await this.documentoRepositorio.buscarPorId(id)
    if (!documento) {
      throw new NotFoundException(Messages.DOCUMENT_NOT_FOUND)
    }

    await this.documentoRepositorio.actualizar(
      id,
      { estado: DocumentoEstado.INACTIVO },
      usuarioAuditoria
    )

    try {
      StorageService.eliminarArchivo(documento.urlArchivo)
    } catch {
      // Si el archivo ya no existe en disco, no bloquea la eliminación
    }

    return { id }
  }

  private async cambiarEstado(
    id: string,
    estado: string,
    usuarioAuditoria: string
  ) {
    const documento = await this.documentoRepositorio.buscarPorId(id)
    if (!documento) {
      throw new NotFoundException(Messages.DOCUMENT_NOT_FOUND)
    }
    await this.documentoRepositorio.actualizar(id, { estado }, usuarioAuditoria)
    return { id, estado }
  }
}
