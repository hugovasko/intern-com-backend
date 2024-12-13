import { IsNotEmpty, IsString, IsBase64 } from 'class-validator';

export class CvUploadDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @IsNotEmpty()
  @IsBase64()
  fileBase64: string;
}