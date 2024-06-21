import { Router } from 'express';

const router = Router();

router.post('/signin', (req, res) => {
  res.json('Hello World!');
});

export default router;
