export interface StorageService {
  saveTextFile(relativePath: string, content: string): Promise<string>;
  savePlaceholderImage(relativePath: string): Promise<string>;
  compressJsonArtifact(publicUrl: string): Promise<void>;
}
