import multer from "multer";
import path from "path";
import fs, { access } from "fs";
import { Request } from "express";
import aws, { Credentials } from "aws-sdk";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS environment variables are not defined');
}


aws.config.update({
  correctClockSkew: true, // Auto-corrects time sync issues
  systemClockOffset: 0,   // Forces no offset
});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

  },
  
});

const getStorage = (folder: string) => {
  const uploadPath = path.join(__dirname, `../../../../frontend/public/${folder}`);

  return multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET!,
    metadata: function (req,file,cb){
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb){
      cb(null, `${folder}/${Date.now()}-${file.originalname}`);
    }
  })

};

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDFs are allowed"));
  }
};


const createUploader = (folder: string) => multer({
  storage: getStorage(folder),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

export const profileUpload = () => createUploader('images').single('profilePic');
export const chatUpload = () => createUploader('chats').single('file');
export const projectUpload = () => createUploader('projects').fields([
  { name: 'image', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]);