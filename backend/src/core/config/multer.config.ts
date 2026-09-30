import { StorageService } from '@/common/lib/storage.service'
import { BadRequestException } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { diskStorage } from 'multer'
import { extname } from 'path'

/**
 * Tipos de imagen permitidos para la galería de publicaciones
 */
export const TIPOS_IMAGEN_PERMITIDOS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

/**
 * Tamaño máximo permitido por imagen (5 MB)
 */
export const TAMANO_MAX_IMAGEN_BYTES = 5 * 1024 * 1024

/**
 * Tipo MIME único permitido para los documentos descargables
 */
export const TIPOS_DOCUMENTO_PERMITIDOS = ['application/pdf'] as const

/**
 * Tamaño máximo permitido por documento (25 MB)
 */
export const TAMANO_MAX_DOCUMENTO_BYTES = 25 * 1024 * 1024

/**
 * Configura el almacenamiento en disco de las imágenes de publicaciones.
 * Las imágenes se guardan en STORAGE_NFS_PATH/publicaciones/<YYYY>/<MM>/<idPublicacion>/
 */
export const multerConfigOpciones = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      try {
        const idPublicacion = (req.body as Record<string, string>).idPublicacion
        const fecha = new Date()
        const anio = fecha.getFullYear().toString()
        const mes = String(fecha.getMonth() + 1).padStart(2, '0')
        const carpeta = idPublicacion
          ? ['publicaciones', anio, mes, idPublicacion]
          : ['publicaciones', anio, mes]
        callback(null, StorageService.asegurarCarpeta(...carpeta))
      } catch (error) {
        callback(error, '')
      }
    },
    filename: (req, file, callback) => {
      // Nombre aleatorio para evitar colisiones y no exponer el nombre original
      const extension = extname(file.originalname).toLowerCase().slice(0, 10)
      const nombre = `${Date.now()}-${randomBytes(8).toString('hex')}${extension}`
      callback(null, nombre)
    },
  }),
  limits: {
    fileSize: TAMANO_MAX_IMAGEN_BYTES,
  },
  fileFilter: (req, file, callback) => {
    if (!TIPOS_IMAGEN_PERMITIDOS.includes(file.mimetype as never)) {
      return callback(
        new BadRequestException(
          `Tipo de archivo no permitido: ${file.mimetype}. Formatos aceptados: JPG, PNG, WEBP, GIF.`
        ),
        false
      )
    }
    callback(null, true)
  },
}

/**
 * Configura el almacenamiento en disco de los documentos descargables.
 * Solo acepta PDF y los guarda en
 * STORAGE_NFS_PATH/documentos/<YYYY>/<MM>/<idCategoria>/
 */
export const multerConfigDocumentos = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      try {
        const idCategoria = (req.body as Record<string, string>).idCategoria
        const fecha = new Date()
        const anio = fecha.getFullYear().toString()
        const mes = String(fecha.getMonth() + 1).padStart(2, '0')
        const carpeta = idCategoria
          ? ['documentos', anio, mes, idCategoria]
          : ['documentos', anio, mes]
        callback(null, StorageService.asegurarCarpeta(...carpeta))
      } catch (error) {
        callback(error, '')
      }
    },
    filename: (req, file, callback) => {
      const extension = extname(file.originalname).toLowerCase().slice(0, 10)
      const nombre = `${Date.now()}-${randomBytes(8).toString('hex')}${extension}`
      callback(null, nombre)
    },
  }),
  limits: {
    fileSize: TAMANO_MAX_DOCUMENTO_BYTES,
  },
  fileFilter: (req, file, callback) => {
    if (!TIPOS_DOCUMENTO_PERMITIDOS.includes(file.mimetype as never)) {
      return callback(
        new BadRequestException(
          `Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan archivos PDF.`
        ),
        false
      )
    }
    callback(null, true)
  },
}
