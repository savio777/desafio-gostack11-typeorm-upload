import { Router, Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request: Request, response: Response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionsRepository.getBalance();
  const transactions = await transactionsRepository.find();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request: Request, response: Response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const { id } = request.params;

    const deleteTransactionService = new DeleteTransactionService();

    await deleteTransactionService.execute(id);

    return response.status(204).send();
  },
);

transactionsRouter.post(
  '/import',
  upload.single('file'),
  (request: Request, response: Response) => {
    const { file } = request;

    const importTransactionsService = new ImportTransactionsService();

    importTransactionsService.execute(file.filename);

    return response.json({ ok: true });
  },
);

export default transactionsRouter;
