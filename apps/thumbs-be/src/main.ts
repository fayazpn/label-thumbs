import express from 'express';
import * as path from 'path';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to thumbs-be!' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

// postgresql://thumbsdb_owner:tR7JUZnmNvu9@ep-polished-dew-a18497y2.ap-southeast-1.aws.neon.tech/thumbsdb?sslmode=require
