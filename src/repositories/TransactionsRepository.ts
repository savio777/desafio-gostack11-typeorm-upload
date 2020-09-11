import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    let income = 0;
    let outcome = 0;

    transactions.map(item => {
      if (item.type === 'income') {
        income += item.value;
      } else if (item.type === 'outcome') {
        outcome += item.value;
      }
    });

    const total = income - outcome;

    const balance: Balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
