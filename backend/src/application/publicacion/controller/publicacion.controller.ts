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
import { PublicacionService } from '../service'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { ParamsSlugDto } from '../dto/params-slug.dto'
import { Request } from 'express'
import {
  ActualizarPublicacionDto,
  CrearPublicacionDto,
  FiltrosPublicacionDto,
} from '../dto'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('Publicaciones')
@ApiBearerAuth()
@Controller('publicaciones')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class PublicacionController extends BaseController {
  constructor(private publicacionServicio: PublicacionService) {
    super()
  }

  @ApiOperation({
    summary: 'API para obtener el listado paginado de publicaciones',
  })
  @Get()
  async listar(@Query() filtrosDto: FiltrosPublicacionDto) {
    const result = await this.publicacionServicio.listar(filtrosDto)
    return this.successListRows(result)
  }

  @ApiOperation({
    summary:
      'API para obtener el listado de publicaciones publicadas y vigentes (solo lectura)',
  })
  @Get('publicadas')
  async listarPublicadas(@Query() filtrosDto: FiltrosPublicacionDto) {
    const result = await this.publicacionServicio.listarPublicadas(filtrosDto)
    return this.successListRows(result)
  }

  @ApiOperation({
    summary: 'API para obtener las publicaciones destacadas para el banner',
  })
  @ApiProperty({
    name: 'limite',
    required: false,
    example: 10,
    description: 'Cantidad máxima de publicaciones a retornar',
  })
  @Get('destacadas')
  async listarDestacadas(@Query('limite') limite?: number) {
    const result = await this.publicacionServicio.listarDestacadas(limite)
    return this.successList(result)
  }

  @ApiOperation({
    summary: 'API para obtener el detalle de una publicación por ID',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Get(':id')
  async buscarPorId(@Param() params: ParamIdDto) {
    const { id } = params
    const result = await this.publicacionServicio.buscarPorId(id)
    return this.success(result)
  }

  @ApiOperation({
    summary: 'API para obtener el detalle de una publicación por su slug',
  })
  @ApiProperty({
    type: ParamsSlugDto,
  })
  @Get('slug/:slug')
  async buscarPorSlug(@Param() params: ParamsSlugDto) {
    const { slug } = params
    const result = await this.publicacionServicio.buscarPorSlug(slug)
    return this.success(result)
  }

  @ApiOperation({
    summary: 'API para crear una nueva publicación',
  })
  @ApiBody({
    type: CrearPublicacionDto,
    description:
      'Cuerpo de la solicitud para registrar una nueva publicación. Nace en estado BORRADOR.',
    required: true,
  })
  @Post()
  async crear(
    @Req() req: Request,
    @Body() publicacionDto: CrearPublicacionDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.publicacionServicio.crear(
      publicacionDto,
      usuarioAuditoria
    )
    return this.successCreate(result)
  }

  @ApiOperation({
    summary: 'API para registrar una visita a una publicación',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Post(':id/vista')
  async registrarVista(@Param() params: ParamIdDto) {
    const { id } = params
    const result = await this.publicacionServicio.registrarVista(id)
    return this.success(result)
  }

  @ApiOperation({
    summary: 'API para actualizar una publicación existente',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @ApiBody({
    type: ActualizarPublicacionDto,
    description:
      'Cuerpo de la solicitud para actualizar los datos de la publicación.',
    required: true,
  })
  @Patch(':id')
  async actualizar(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Body() publicacionDto: ActualizarPublicacionDto
  ) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.publicacionServicio.actualizarDatos(
      id,
      publicacionDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary: 'API para publicar una publicación (cambia estado a PUBLICADO)',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Patch(':id/publicacion')
  async publicar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.publicacionServicio.publicar(id, usuarioAuditoria)
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary: 'API para devolver una publicación a estado BORRADOR',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Patch(':id/borrador')
  async pasarABorrador(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.publicacionServicio.pasarABorrador(
      id,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary: 'API para inactivar una publicación',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Patch(':id/inactivacion')
  async inactivar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.publicacionServicio.inactivar(
      id,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }
}
