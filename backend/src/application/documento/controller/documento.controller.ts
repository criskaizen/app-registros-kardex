import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { DocumentoService } from '../service'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import {
  ActualizarDocumentoDto,
  CrearDocumentoDto,
  FiltrosDocumentoDto,
} from '../dto'
import { multerConfigDocumentos } from '@/core/config/multer.config'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('Documentos Descargables')
@ApiBearerAuth()
@Controller('documentos')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class DocumentoController extends BaseController {
  constructor(private documentoServicio: DocumentoService) {
    super()
  }

  @ApiOperation({
    summary: 'API para obtener el listado paginado de documentos descargables',
  })
  @Get()
  async listar(@Query() filtrosDto: FiltrosDocumentoDto) {
    const result = await this.documentoServicio.listar(filtrosDto)
    return this.successListRows(result)
  }

  @ApiOperation({
    summary:
      'API para obtener los documentos destacados, ordenados por número de descargas',
  })
  @ApiProperty({
    name: 'limite',
    required: false,
    example: 10,
    description: 'Cantidad máxima de documentos a retornar',
  })
  @Get('destacados')
  async listarDestacados(@Query('limite') limite?: number) {
    const result = await this.documentoServicio.listarDestacados(limite)
    return this.successList(result)
  }

  @ApiOperation({
    summary: 'API para obtener todas las versiones de un documento',
  })
  @ApiParam({
    name: 'codigoDocumento',
    type: String,
    description: 'Código oficial del documento (ej: FORM-KARDEX-01)',
  })
  @Get('versiones/:codigoDocumento')
  async listarVersiones(@Param('codigoDocumento') codigoDocumento: string) {
    const result = await this.documentoServicio.listarVersiones(codigoDocumento)
    return this.successList(result)
  }

  @ApiOperation({
    summary: 'API para obtener el detalle de un documento por ID',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Get(':id')
  async buscarPorId(@Param() params: ParamIdDto) {
    const { id } = params
    const result = await this.documentoServicio.buscarPorId(id)
    return this.success(result)
  }

  @ApiOperation({
    summary: 'API para subir un documento descargable (PDF)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CrearDocumentoDto,
    description:
      'Cuerpo de la solicitud con los metadatos del documento. El archivo PDF se envía en el campo "file".',
    required: true,
  })
  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfigDocumentos))
  async crear(
    @Req() req: Request,
    @UploadedFile() archivo: Express.Multer.File,
    @Body() documentoDto: CrearDocumentoDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.documentoServicio.crear(
      documentoDto,
      archivo,
      usuarioAuditoria
    )
    return this.successCreate(result)
  }

  @ApiOperation({
    summary: 'API para registrar la descarga de un documento',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Post(':id/descarga')
  async registrarDescarga(@Param() params: ParamIdDto) {
    const { id } = params
    const result = await this.documentoServicio.registrarDescarga(id)
    return this.success(result)
  }

  @ApiOperation({
    summary: 'API para actualizar un documento descargable',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @ApiBody({
    type: ActualizarDocumentoDto,
    description:
      'Cuerpo de la solicitud para actualizar los metadatos del documento. El archivo no se modifica.',
    required: true,
  })
  @Patch(':id')
  async actualizar(
    @Param() params: ParamIdDto,
    @Req() req: Request,
    @Body() documentoDto: ActualizarDocumentoDto
  ) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.documentoServicio.actualizarDatos(
      id,
      documentoDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary: 'API para activar un documento descargable',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Patch(':id/activacion')
  async activar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.documentoServicio.activar(id, usuarioAuditoria)
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary: 'API para inactivar un documento descargable',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Patch(':id/inactivacion')
  async inactivar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.documentoServicio.inactivar(id, usuarioAuditoria)
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary:
      'API para eliminar un documento: lo inactiva y borra el archivo del almacenamiento',
  })
  @ApiProperty({
    type: ParamIdDto,
  })
  @Delete(':id')
  async eliminar(@Req() req: Request, @Param() params: ParamIdDto) {
    const { id } = params
    const usuarioAuditoria = this.getUser(req)
    const result = await this.documentoServicio.eliminar(id, usuarioAuditoria)
    return this.successDelete(result)
  }
}
