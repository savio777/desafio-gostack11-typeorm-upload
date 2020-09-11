import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    let category_id = '';

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('there is no balance');
    }

    const categorieFindTitle = await categoriesRepository.getCategory(category);

    if (categorieFindTitle !== '') {
      category_id = categorieFindTitle;
    } else {
      const categoryCreate = await categoriesRepository.createCategory(
        category,
      );

      category_id = categoryCreate.id;
    }

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}
/*
if (true) {
  throw new AppError('Error', 200);
  //throw new AppError('Error');
}
*/

export default CreateTransactionService;
