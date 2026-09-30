import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { CategoriaDocumentoService } from '../service'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { BaseController } from '@/common/base'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import {
  ActualizarCategoriaDocumentoDto,
  CrearCategoriaDocumentoDto,
} from '../dto'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('Categorías de Documento')
@ApiBearerAuth()
@Controller('categorias-documento')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class CategoriaDocumentoController extends BaseController {
  constructor(private categoriaDocumentoServicio: CategoriaDocumentoService) {
    super()
  }

  @ApiOperation({
    summary: 'API para obtener el listado paginado de categorías de documento',
  })
  @Get()
  async listar(@Query() paginacionQueryDto: PaginacionQueryDto) {
    const result =
      await this.categoriaDocumentoServicio.listar(paginacionQueryDto)
    return this.successListRows(result)
  }

  @ApiOperation({
    summary:
      'API para obtener el listado de categorías de documento activas (sin paginación)',
  })
  @Get('activos')
  async listarActivos() {
    const result = await this.categoriaDocumentoServicio.listarActivos()
    return this.successList(result)
  }

  @ApiOperation({
    summary: 'API para obtener el detalle de una categoría de documento por ID',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Get(':id')
  async buscarPorId(@Param() params: ParamIdDto) {
    const { id } = params
    const result = await this.categoriaDocumentoServicio.buscarPorId(id)
    return this.success(result)
  }

  @ApiOperation({
    summary: 'API para crear una nueva categoría de documento',
  })
  @ApiBody({
    type: CrearCategoriaDocumentoDto,
    description:
      'Cuerpo de la solicitud para registrar una nueva categoría de documento.',
    required: true,
  })
  @Post()
  async crear(
    @Req() req: Request,
    @Body() categoriaDto: CrearCategoriaDocumentoDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.categoriaDocumentoServicio.crear(
      categoriaDto,
      usuarioAuditoria
    )
    return this.successCreate(result)
  }

  @ApiOperation({
    summary: 'API para actualizar una categoría de documento existente',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @ApiBody({
    type: ActualizarCategoriaDocumentoDto,
    description:
      'Cuerpo de la solicitud para actualizar los datos de la categoría.',
    required: true,
  })
  @Patch(':id')
  async actualizar(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Body() categoriaDto: ActualizarCategoriaDocumentoDto
  ) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.categoriaDocumentoServicio.actualizarDatos(
      id,
      categoriaDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary: 'API para activar una categoría de documento',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Patch('/:id/activacion')
  async activar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.categoriaDocumentoServicio.activar(
      id,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary: 'API para inactivar una categoría de documento',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Patch('/:id/inactivacion')
  async inactivar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.categoriaDocumentoServicio.inactivar(
      id,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }
}
