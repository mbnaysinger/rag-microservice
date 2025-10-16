export class Pagination {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly sort: string = 'createdAt',
    public readonly order: string = 'desc', // Adicione este parâmetro
  ) {}

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }

  // Método para obter as opções de ordenação para uso com TypeORM ou outros ORMs
  get orderBy(): Record<string, 'ASC' | 'DESC'> {
    return { [this.sort]: this.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' };
  }
}
