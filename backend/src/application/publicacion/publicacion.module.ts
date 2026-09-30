import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Publicacion, PublicacionImagen } from './entity'
import {
  PublicacionRepository,
  PublicacionImagenRepository,
} from './repository'
import { PublicacionService, PublicacionImagenService } from './service'
import {
  PublicacionController,
  PublicacionImagenController,
} from './controller'
import { CategoriaPublicacionModule } from '@/application/categoria-publicacion/categoria-publicacion.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Publicacion, PublicacionImagen]),
    CategoriaPublicacionModule,
  ],
  controllers: [PublicacionController, PublicacionImagenController],
  providers: [
    PublicacionService,
    PublicacionRepository,
    PublicacionImagenService,
    PublicacionImagenRepository,
  ],
  exports: [PublicacionService, PublicacionImagenService],
})
export class PublicacionModule {}
