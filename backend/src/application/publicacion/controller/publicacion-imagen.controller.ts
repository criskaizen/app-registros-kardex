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
import { PublicacionImagenService } from '../service'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { BaseController } from '@/common/base'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Request } from 'express'
import {
  ActualizarPublicacionImagenDto,
  CrearPublicacionImagenDto,
  FiltrosPublicacionImagenDto,
} from '../dto'
import { multerConfigOpciones } from '@/core/config/multer.config'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('Imágenes de Publicación')
@ApiBearerAuth()
@Controller('publicaciones/:idPublicacion/imagenes')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class PublicacionImagenController extends BaseController {
  constructor(private imagenServicio: PublicacionImagenService) {
    super()
  }

  @ApiOperation({
    summary: 'API para obtener el listado de imágenes de una publicación',
  })
  @ApiProperty({
    type: PaginacionQueryDto,
    required: false,
  })
  @Get()
  async listar(
    @Param('idPublicacion') idPublicacion: string,
    @Query() paginacionQueryDto: PaginacionQueryDto
  ) {
    const result = await this.imagenServicio.listarPorPublicacion(
      idPublicacion,
      paginacionQueryDto
    )
    return this.successListRows(result)
  }

  @ApiOperation({
    summary:
      'API para obtener las imágenes portada de las publicaciones publicadas',
  })
  @Get('portadas')
  async listarPortadas(@Query() filtrosDto: FiltrosPublicacionImagenDto) {
    const result = await this.imagenServicio.listarDestacadas(filtrosDto)
    return this.successListRows(result)
  }

  @ApiOperation({
    summary: 'API para obtener el detalle de una imagen por ID',
  })
  @ApiParam({
    name: 'idImagen',
    type: String,
    description: 'Id de la imagen',
  })
  @Get('/:idImagen')
  async buscarPorId(@Param('idImagen') idImagen: string) {
    const result = await this.imagenServicio.buscarPorId(idImagen)
    return this.success(result)
  }

  @ApiOperation({
    summary: 'API para subir una imagen a una publicación',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CrearPublicacionImagenDto,
    description:
      'Cuerpo de la solicitud con los metadatos de la imagen. El archivo binario se envía en el campo "file".',
    required: true,
  })
  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfigOpciones))
  async crear(
    @Param('idPublicacion') idPublicacion: string,
    @Req() req: Request,
    @UploadedFile() archivo: Express.Multer.File,
    @Body() imagenDto: CrearPublicacionImagenDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.imagenServicio.crear(
      { ...imagenDto, idPublicacion },
      archivo,
      usuarioAuditoria
    )
    return this.successCreate(result)
  }

  @ApiOperation({
    summary: 'API para actualizar los metadatos de una imagen',
  })
  @ApiParam({
    name: 'idImagen',
    type: String,
    description: 'Id de la imagen',
  })
  @ApiBody({
    type: ActualizarPublicacionImagenDto,
    description:
      'Cuerpo de la solicitud para actualizar los metadatos de la imagen.',
    required: true,
  })
  @Patch('/:idImagen')
  async actualizar(
    @Param('idImagen') idImagen: string,
    @Req() req: Request,
    @Body() imagenDto: ActualizarPublicacionImagenDto
  ) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.imagenServicio.actualizarDatos(
      idImagen,
      imagenDto,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary: 'API para marcar una imagen como portada de la publicación',
  })
  @ApiParam({
    name: 'idImagen',
    type: String,
    description: 'Id de la imagen',
  })
  @Patch('/:idImagen/portada')
  async marcarPortada(
    @Param('idImagen') idImagen: string,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.imagenServicio.marcarPortada(
      idImagen,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary:
      'API para inactivar una imagen (sin eliminarla del almacenamiento)',
  })
  @ApiParam({
    name: 'idImagen',
    type: String,
    description: 'Id de la imagen',
  })
  @Patch('/:idImagen/inactivacion')
  async inactivar(@Param('idImagen') idImagen: string, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.imagenServicio.inactivar(
      idImagen,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary: 'API para reactivar una imagen inactivada',
  })
  @ApiParam({
    name: 'idImagen',
    type: String,
    description: 'Id de la imagen',
  })
  @Patch('/:idImagen/activacion')
  async reactivar(@Param('idImagen') idImagen: string, @Req() req: Request) {
    const usuarioAuditoria = this.getUser(req)
    const result = await this.imagenServicio.reactivar(
      idImagen,
      usuarioAuditoria
    )
    return this.successUpdate(result)
  }

  @ApiOperation({
    summary:
      'API para eliminar permanentemente una imagen y su archivo del almacenamiento',
  })
  @ApiParam({
    name: 'idImagen',
    type: String,
    description: 'Id de la imagen',
  })
  @Delete('/:idImagen')
  async eliminar(@Param('idImagen') idImagen: string) {
    const result = await this.imagenServicio.eliminar(idImagen)
    return this.successDelete(result)
  }
}
