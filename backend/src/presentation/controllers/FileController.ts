import { Request, Response, NextFunction } from "express";
import { UploadFileUseCase } from "../../application/usecases/file/UploadFileUseCase";

const uploadFileUseCase = new UploadFileUseCase();

export const FileController = {
  uploadFiles: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filePaths = await uploadFileUseCase.execute(req);
      res.status(200).json({ message: "Files uploaded successfully", files: filePaths });
    } catch (error) {
      next(error);
    }
  },
};
