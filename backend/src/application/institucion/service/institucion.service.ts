import { BaseService } from '@/common/base/base-service'
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InstitucionRepository } from '../repository'
import { InstitucionDto } from '../dto'
import { Messages } from '@/common/constants/response-messages'

@Injectable()
export class InstitucionService extends BaseService {
  constructor(
    @Inject(InstitucionRepository)
    private institucionRepositorio: InstitucionRepository
  ) {
    super()
  }

  async obtener() {
    const institucion = await this.institucionRepositorio.buscarUnica()
    if (!institucion) {
      throw new NotFoundException(Messages.INSTITUCION_NOT_FOUND)
    }
    return institucion
  }

  /**
   * Crea la institución si aún no existe, o actualiza la existente.
   * Como la tabla es singleton, un PUT resuelve ambos casos.
   */
  async guardar(institucionDto: InstitucionDto, usuarioAuditoria: string) {
    const existente = await this.institucionRepositorio.buscarUnica()

    if (existente) {
      await this.institucionRepositorio.actualizar(
        existente.id,
        institucionDto,
        usuarioAuditoria
      )
      return { id: existente.id, creado: false }
    }

    const total = await this.institucionRepositorio.contar()
    if (total > 0) {
      throw new ConflictException(Messages.INSTITUCION_ALREADY_EXISTS)
    }

    const institucion = await this.institucionRepositorio.crear(
      institucionDto,
      usuarioAuditoria
    )
    return { id: institucion.id, creado: true }
  }
}
