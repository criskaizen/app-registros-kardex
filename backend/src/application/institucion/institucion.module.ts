import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Institucion } from './entity'
import { InstitucionRepository } from './repository'
import { InstitucionService } from './service'
import { InstitucionController } from './controller'

@Module({
  imports: [TypeOrmModule.forFeature([Institucion])],
  controllers: [InstitucionController],
  providers: [InstitucionService, InstitucionRepository],
  exports: [InstitucionService],
})
export class InstitucionModule {}
