import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoriaDocumento } from './entity'
import { CategoriaDocumentoRepository } from './repository'
import { CategoriaDocumentoService } from './service'
import { CategoriaDocumentoController } from './controller'

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaDocumento])],
  controllers: [CategoriaDocumentoController],
  providers: [CategoriaDocumentoService, CategoriaDocumentoRepository],
  exports: [CategoriaDocumentoService, CategoriaDocumentoRepository],
})
export class CategoriaDocumentoModule {}
