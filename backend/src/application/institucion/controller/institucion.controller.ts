import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common'
import { InstitucionService } from '../service'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'
import { Request } from 'express'
import { InstitucionDto } from '../dto'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Institución')
@ApiBearerAuth()
@Controller('institucion')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class InstitucionController extends BaseController {
  constructor(private institucionServicio: InstitucionService) {
    super()
  }

  @ApiOperation({
    summary: 'API para obtener los datos de la institución',
  })
  @Get()
  async obtener() {
    const result = await this.institucionServicio.obtener()
    return this.success(result)
  }

  @ApiOperation({
    summary:
      'API para registrar o actualizar los datos de la institución (upsert)',
  })
  @ApiBody({
    type: InstitucionDto,
    description:
      'Cuerpo de la solicitud con los datos de la institución. Si no existe un registro activo, se crea; si existe, se actualiza.',
    required: true,
  })
  @Put()
  async guardar(@Req() req: Request, @Body() institucionDto: InstitucionDto) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.institucionServicio.guardar(
      institucionDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }
}
