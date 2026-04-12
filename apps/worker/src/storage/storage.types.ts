export interface StorageService {
  saveTextFile(relativePath: string, content: string): Promise<string>;
  saveBinaryFile(relativePath: string, content: Uint8Array): Promise<string>;
  savePlaceholderImage(relativePath: string): Promise<string>;
  compressJsonArtifact(publicUrl: string): Promise<void>;
}
