import { Injectable } from '@nestjs/common'
import { existsSync, mkdirSync, unlinkSync } from 'fs'
import { join, resolve, sep } from 'path'

/**
 * Servicio de almacenamiento de archivos en disco (o NFS montado).
 * Solo guarda metadatos en la base de datos: los binarios viven en el filesystem.
 */
@Injectable()
export class StorageService {
  /**
   * Ruta raíz configurada en STORAGE_NFS_PATH
   */
  static get rootPath(): string {
    return (process.env.STORAGE_NFS_PATH || '').replace(/[/\\]+$/, '')
  }

  /**
   * Indica si el storage fue configurado correctamente
   */
  static get habilitado(): boolean {
    return StorageService.rootPath.length > 0
  }

  /**
   * Devuelve la ruta absoluta de una carpeta, creándola si no existe
   */
  static asegurarCarpeta(...segmentos: string[]): string {
    if (!StorageService.habilitado) {
      throw new Error('STORAGE_NFS_PATH no está configurado en el entorno')
    }
    const ruta = join(StorageService.rootPath, ...segmentos)
    if (!existsSync(ruta)) {
      mkdirSync(ruta, { recursive: true })
    }
    return ruta
  }

  /**
   * Construye la ruta absoluta de un archivo a partir de su ruta relativa
   * almacenada en la base de datos.
   */
  static rutaAbsoluta(rutaRelativa: string): string {
    const absoluta = resolve(StorageService.rootPath, rutaRelativa)
    const raiz = resolve(StorageService.rootPath)
    // Evita que una ruta relativa con ".." escape del directorio raíz
    if (!absoluta.startsWith(raiz + sep) && absoluta !== raiz) {
      throw new Error('Ruta de archivo fuera del directorio de almacenamiento')
    }
    return absoluta
  }

  /**
   * Elimina un archivo del almacenamiento. Silencioso si no existe.
   */
  static eliminarArchivo(rutaRelativa: string): void {
    const absoluta = StorageService.rutaAbsoluta(rutaRelativa)
    if (existsSync(absoluta)) {
      unlinkSync(absoluta)
    }
  }
}
