import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parse';

import Transaction from '../models/Transaction';

import confUpload from '../config/upload';

class ImportTransactionsService {
  //  async execute(file: string): Promise<Transaction[]> {

  execute(file: string): void {
    const transactionsRepository = getRepository(Transaction);

    const dataRows = [];

    const filePath = path.join(confUpload.directory, file);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', data => dataRows.push(data))
      .on('end', () => {
        console.log('res ', dataRows);
      });
  }
}

export default ImportTransactionsService;
