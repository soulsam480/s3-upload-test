import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {
  GetObjectCommandInput,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { getObject, getObjects, putObject } from './services';
import { BUCKET, normalize } from './helpers';

const FILE_LIMIT = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { files: 1, fileSize: FILE_LIMIT },
}).single('file');

const app = express();
app.use(express.Router());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', upload, (req, res) => {
  res.send({
    sent: req.body,
  });
});

app.get('/cdn', async (req, res) => {
  return res.json(await getObjects());
});

app.post('/cdn', upload, async (req, res) => {
  try {
    const { scope = '' } = req.query;

    const objectParams: PutObjectCommandInput = {
      Bucket: BUCKET,
      Key: `${scope ? `${scope}/` : ''}${uuidv4()}--${normalize(
        req.file.originalname,
      )}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      Metadata: {
        type: req.file.mimetype,
      },
    };

    const response = await putObject(objectParams);

    res.json(response);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/cdn/file', async (req, res) => {
  try {
    const { file_name } = req.query;

    if (!file_name) return res.status(400).send('No filename found !');

    const objectParams: GetObjectCommandInput = {
      Bucket: BUCKET,
      Key: file_name as string,
    };

    const response = await getObject(objectParams);

    if (!response) return res.status(400).send("File doesn't exist !");

    const { file, type } = response;

    // res.setHeader('Content-Type', (type as string) || 'application/json');

    res.send(file);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});
