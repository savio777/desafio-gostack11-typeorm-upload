import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async getCategory(title: string): Promise<string> {
    const category = await this.findOne({
      where: { title },
    });

    let categoryIdPerhaps = '';

    if (category && category.id) {
      categoryIdPerhaps = category.id;
    }

    return categoryIdPerhaps;
  }

  public async createCategory(title: string): Promise<Category> {
    const category = await this.create({
      title,
    });

    await this.save(category);

    return category;
  }
}

export default CategoriesRepository;
