import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Documento } from './entity'
import { DocumentoRepository } from './repository'
import { DocumentoService } from './service'
import { DocumentoController } from './controller'
import { CategoriaDocumentoModule } from '@/application/categoria-documento/categoria-documento.module'

@Module({
  imports: [TypeOrmModule.forFeature([Documento]), CategoriaDocumentoModule],
  controllers: [DocumentoController],
  providers: [DocumentoService, DocumentoRepository],
  exports: [DocumentoService],
})
export class DocumentoModule {}
