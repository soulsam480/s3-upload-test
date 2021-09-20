import {
  GetObjectCommand,
  GetObjectCommandInput,
  ListObjectsCommand,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { BUCKET, streamToString } from '../helpers';
import { s3Client } from '../s3/s3client';

export async function getObjects() {
  try {
    const data = await s3Client.send(
      new ListObjectsCommand({ Bucket: BUCKET }),
    );

    return data.Contents;
  } catch (error) {
    Promise.reject(error);
  }
}

export async function putObject(data: PutObjectCommandInput) {
  try {
    const response = await s3Client.send(new PutObjectCommand(data));

    return response;
  } catch (error) {
    Promise.reject(error);
  }
}

export async function getObject(data: GetObjectCommandInput) {
  try {
    const response = await s3Client.send(new GetObjectCommand(data));

    const file = await streamToString(response.Body);

    return { file, type: response.Metadata?.type };
  } catch (error) {
    Promise.reject(error);
  }
}
