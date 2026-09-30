import { BaseService } from '@/common/base/base-service'
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CategoriaDocumentoRepository } from '../repository'
import {
  ActualizarCategoriaDocumentoDto,
  CrearCategoriaDocumentoDto,
} from '../dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Messages } from '@/common/constants/response-messages'
import { CategoriaDocumentoEstado } from '../constant'

@Injectable()
export class CategoriaDocumentoService extends BaseService {
  constructor(
    @Inject(CategoriaDocumentoRepository)
    private categoriaRepositorio: CategoriaDocumentoRepository
  ) {
    super()
  }

  async crear(
    categoriaDto: CrearCategoriaDocumentoDto,
    usuarioAuditoria: string
  ) {
    const categoriaExistente = await this.categoriaRepositorio.buscarPorCodigo(
      categoriaDto.codigo
    )

    if (categoriaExistente) {
      throw new ConflictException(Messages.REPEATED_CATEGORY)
    }

    return await this.categoriaRepositorio.crear(categoriaDto, usuarioAuditoria)
  }

  async listar(paginacionQueryDto: PaginacionQueryDto) {
    return await this.categoriaRepositorio.listar(paginacionQueryDto)
  }

  async listarActivos() {
    return await this.categoriaRepositorio.listarActivos()
  }

  async buscarPorId(id: string) {
    const categoria = await this.categoriaRepositorio.buscarPorId(id)
    if (!categoria) {
      throw new NotFoundException(Messages.EXCEPTION_NOT_FOUND)
    }
    return categoria
  }

  async actualizarDatos(
    id: string,
    categoriaDto: ActualizarCategoriaDocumentoDto,
    usuarioAuditoria: string
  ) {
    const categoria = await this.categoriaRepositorio.buscarPorId(id)
    if (!categoria) {
      throw new NotFoundException(Messages.EXCEPTION_NOT_FOUND)
    }

    if (categoriaDto.codigo && categoriaDto.codigo !== categoria.codigo) {
      const categoriaExistente =
        await this.categoriaRepositorio.buscarPorCodigo(categoriaDto.codigo)
      if (categoriaExistente) {
        throw new ConflictException(Messages.REPEATED_CATEGORY)
      }
    }

    await this.categoriaRepositorio.actualizar(
      id,
      categoriaDto,
      usuarioAuditoria
    )
    return { id }
  }

  async activar(idCategoria: string, usuarioAuditoria: string) {
    const categoria = await this.categoriaRepositorio.buscarPorId(idCategoria)
    if (!categoria) {
      throw new NotFoundException(Messages.EXCEPTION_NOT_FOUND)
    }
    const categoriaDto = new ActualizarCategoriaDocumentoDto()
    categoriaDto.estado = CategoriaDocumentoEstado.ACTIVO
    await this.categoriaRepositorio.actualizar(
      idCategoria,
      categoriaDto,
      usuarioAuditoria
    )
    return {
      id: idCategoria,
      estado: categoriaDto.estado,
    }
  }

  async inactivar(idCategoria: string, usuarioAuditoria: string) {
    const categoria = await this.categoriaRepositorio.buscarPorId(idCategoria)
    if (!categoria) {
      throw new NotFoundException(Messages.EXCEPTION_NOT_FOUND)
    }
    const categoriaDto = new ActualizarCategoriaDocumentoDto()
    categoriaDto.estado = CategoriaDocumentoEstado.INACTIVO
    await this.categoriaRepositorio.actualizar(
      idCategoria,
      categoriaDto,
      usuarioAuditoria
    )
    return {
      id: idCategoria,
      estado: categoriaDto.estado,
    }
  }
}
