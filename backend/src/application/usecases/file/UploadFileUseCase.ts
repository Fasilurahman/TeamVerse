import { Request } from "express";

export class UploadFileUseCase {
  async execute(req: Request): Promise<string[]> {
    if (!req.files) {
      throw new Error("No files uploaded.");
    }

    const files = req.files as Express.Multer.File[];
    return files.map(file => file.path); // Return file paths
  }
}
