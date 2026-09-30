import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoriaPublicacion } from './entity'
import { CategoriaPublicacionRepository } from './repository'
import { CategoriaPublicacionService } from './service'
import { CategoriaPublicacionController } from './controller'

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaPublicacion])],
  controllers: [CategoriaPublicacionController],
  providers: [CategoriaPublicacionService, CategoriaPublicacionRepository],
  exports: [CategoriaPublicacionService, CategoriaPublicacionRepository],
})
export class CategoriaPublicacionModule {}
