import { BaseService } from '@/common/base/base-service'
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CategoriaPublicacionRepository } from '../repository'
import {
  ActualizarCategoriaPublicacionDto,
  CrearCategoriaPublicacionDto,
} from '../dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Messages } from '@/common/constants/response-messages'
import { CategoriaPublicacionEstado } from '../constant'

@Injectable()
export class CategoriaPublicacionService extends BaseService {
  constructor(
    @Inject(CategoriaPublicacionRepository)
    private categoriaRepositorio: CategoriaPublicacionRepository
  ) {
    super()
  }

  async crear(
    categoriaDto: CrearCategoriaPublicacionDto,
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
    categoriaDto: ActualizarCategoriaPublicacionDto,
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
    const categoriaDto = new ActualizarCategoriaPublicacionDto()
    categoriaDto.estado = CategoriaPublicacionEstado.ACTIVO
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
    const categoriaDto = new ActualizarCategoriaPublicacionDto()
    categoriaDto.estado = CategoriaPublicacionEstado.INACTIVO
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
