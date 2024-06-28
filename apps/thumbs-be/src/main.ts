import express from 'express';
import * as path from 'path';
import userRouter from './routers/user';
import workerRouter from './routers/worker';

const app = express();

app.use(express.json());

// Move this to env later

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use('/v1/user', userRouter);
app.use('/v1/worker', workerRouter);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
