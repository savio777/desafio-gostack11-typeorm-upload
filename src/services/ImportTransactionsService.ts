import { getRepository, getCustomRepository, In } from 'typeorm';
import fs from 'fs';
import csv from 'csv-parse';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface CSVTransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    const contactsReadStream = fs.createReadStream(path);

    const parsers = csv({ from_line: 2 });

    const parseCsv = contactsReadStream.pipe(parsers);

    const transactions: CSVTransactionDTO[] = [];
    const categories: string[] = [];

    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value || !category) return;

      categories.push(category);
      transactions.push({ title, type, value: Number(value), category });
    });

    // esperar todo o processo de percorrer a planilha terminar
    await new Promise(resolve => parseCsv.on('end', resolve));

    const existenceCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });

    const existenceCategoriesTitles = existenceCategories.map(
      (category: Category) => category.title,
    );

    // todas q não existirem no banco
    const addCategoryTitles = categories
      .filter(c => !existenceCategoriesTitles.includes(c))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = await categoriesRepository.create(
      addCategoryTitles.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const allCategories = [...newCategories, ...existenceCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(t => ({
        title: t.title,
        type: t.type,
        value: t.value,
        category: allCategories.find(c => c.title === t.category),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(path);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
