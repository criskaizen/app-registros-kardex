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
import { CategoriaPublicacionService } from '../service'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { BaseController } from '@/common/base'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import {
  ActualizarCategoriaPublicacionDto,
  CrearCategoriaPublicacionDto,
} from '../dto'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('Categorías de Publicación')
@ApiBearerAuth()
@Controller('categorias-publicacion')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class CategoriaPublicacionController extends BaseController {
  constructor(
    private categoriaPublicacionServicio: CategoriaPublicacionService
  ) {
    super()
  }

  @ApiOperation({
    summary:
      'API para obtener el listado paginado de categorías de publicación',
  })
  @Get()
  async listar(@Query() paginacionQueryDto: PaginacionQueryDto) {
    const result =
      await this.categoriaPublicacionServicio.listar(paginacionQueryDto)
    return this.successListRows(result)
  }

  @ApiOperation({
    summary:
      'API para obtener el listado de categorías de publicación activas (sin paginación)',
  })
  @Get('activos')
  async listarActivos() {
    const result = await this.categoriaPublicacionServicio.listarActivos()
    return this.successList(result)
  }

  @ApiOperation({
    summary:
      'API para obtener el detalle de una categoría de publicación por ID',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Get(':id')
  async buscarPorId(@Param() params: ParamIdDto) {
    const { id } = params
    const result = await this.categoriaPublicacionServicio.buscarPorId(id)
    return this.success(result)
  }

  @ApiOperation({
    summary: 'API para crear una nueva categoría de publicación',
  })
  @ApiBody({
    type: CrearCategoriaPublicacionDto,
    description:
      'Cuerpo de la solicitud para registrar una nueva categoría de publicación.',
    required: true,
  })
  @Post()
  async crear(
    @Req() req: Request,
    @Body() categoriaDto: CrearCategoriaPublicacionDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.categoriaPublicacionServicio.crear(
      categoriaDto,
      usuarioAuditoria
    )
    return this.successCreate(result)
  }

  @ApiOperation({
    summary: 'API para actualizar una categoría de publicación existente',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @ApiBody({
    type: ActualizarCategoriaPublicacionDto,
    description:
      'Cuerpo de la solicitud para actualizar los datos de la categoría.',
    required: true,
  })
  @Patch(':id')
  async actualizar(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Body() categoriaDto: ActualizarCategoriaPublicacionDto
  ) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.categoriaPublicacionServicio.actualizarDatos(
      id,
      categoriaDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary: 'API para activar una categoría de publicación',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Patch('/:id/activacion')
  async activar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.categoriaPublicacionServicio.activar(
      id,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary: 'API para inactivar una categoría de publicación',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Patch('/:id/inactivacion')
  async inactivar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.categoriaPublicacionServicio.inactivar(
      id,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }
}
