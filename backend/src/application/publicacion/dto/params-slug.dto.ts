import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from '@/common/validation'

export class ParamsSlugDto {
  @ApiProperty({
    example: 'convocatoria-concurso-publico-2026',
    name: 'slug',
    description: 'URL amigable única de la publicación',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  slug: string
}
