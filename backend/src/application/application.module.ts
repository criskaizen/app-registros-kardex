import { Module } from '@nestjs/common'
import { ParametroModule } from './parametro/parametro.module'
import { CategoriaPublicacionModule } from './categoria-publicacion/categoria-publicacion.module'
import { PublicacionModule } from './publicacion/publicacion.module'
import { CategoriaDocumentoModule } from './categoria-documento/categoria-documento.module'
import { DocumentoModule } from './documento/documento.module'
import { InstitucionModule } from './institucion/institucion.module'

@Module({
  imports: [
    ParametroModule,
    CategoriaPublicacionModule,
    PublicacionModule,
    CategoriaDocumentoModule,
    DocumentoModule,
    InstitucionModule,
  ],
})
export class ApplicationModule {}
