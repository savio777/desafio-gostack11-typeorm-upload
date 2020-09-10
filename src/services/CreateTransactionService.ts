import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

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
    const transactionRepository = getRepository(Transaction);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    let category_id = '';

    const categorieFindTitle = await categoriesRepository.getCategory(category);

    if (categorieFindTitle !== '') {
      category_id = categorieFindTitle;
    } else {
      const categoryCreate = await categoriesRepository.createCategory(
        category,
      );

      category_id = categoryCreate.id;
    }

    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

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
