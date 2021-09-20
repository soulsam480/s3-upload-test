export const BUCKET = process.env.BUCKET_NAME as string;

export function normalize(str: string) {
  return str
    .replace(/#|\/|\?|-/g, '')
    .split(' ')
    .join('_');
}

export const streamToString = (stream: any) =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
