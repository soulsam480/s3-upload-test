import express from 'express';
import cors from 'cors';
import multer from 'multer';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

console.log(s3.endpoint);

const storage = multer.memoryStorage();

const upload = multer({ storage }).single('image');

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

app.post('/upload', upload, (req, res) => {
  let myFile = req.file.originalname.split('.');
  const fileType = myFile[myFile.length - 1];

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Key: `images/${uuidv4()}.${fileType}`,
    Body: req.file.buffer,
  };

  s3.upload(params, (error: any, data: any) => {
    if (error) {
      res.status(500).send(error);
    }

    res.status(200).json({
      url: data.Location,
    });
  });
});

app.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});
