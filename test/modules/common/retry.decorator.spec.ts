import { Retry } from '../../../src/modules/common/retry/retry.decorator';

describe('Decorator de Retry', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  describe('Execução bem-sucedida', () => {
    it('deve executar o método uma vez quando não ocorre erro', async () => {
      let contadorChamadas = 0;

      class ClasseTeste {
        @Retry(3, 100)
        async metodoSucesso() {
          contadorChamadas++;
          return 'sucesso';
        }
      }

      const instancia = new ClasseTeste();
      const resultado = await instancia.metodoSucesso();

      expect(resultado).toBe('sucesso');
      expect(contadorChamadas).toBe(1);
    });
  });

  describe('Retry em caso de falha', () => {
    it('deve tentar 3 vezes e ter sucesso na 3ª tentativa', async () => {
      let contadorChamadas = 0;

      class ClasseTeste {
        @Retry(3, 50)
        async metodoComFalha() {
          contadorChamadas++;
          if (contadorChamadas < 3) {
            throw new Error(`Tentativa ${contadorChamadas} falhou`);
          }
          return `sucesso na tentativa ${contadorChamadas}`;
        }
      }

      const instancia = new ClasseTeste();
      const inicio = Date.now();
      const resultado = await instancia.metodoComFalha();
      const duracao = Date.now() - inicio;

      expect(resultado).toBe('sucesso na tentativa 3');
      expect(contadorChamadas).toBe(3);

      expect(duracao).toBeGreaterThanOrEqual(150);
    });

    it('deve lançar erro após esgotar todas as tentativas de retry', async () => {
      let contadorChamadas = 0;

      class ClasseTeste {
        @Retry(2, 50)
        async metodoSempreFalha() {
          contadorChamadas++;
          throw new Error(`Falha ${contadorChamadas}`);
        }
      }

      const instancia = new ClasseTeste();

      await expect(instancia.metodoSempreFalha()).rejects.toThrow('Falha 2');
      expect(contadorChamadas).toBe(2);
    });
  });

  describe('Cálculo de atraso', () => {
    it('deve respeitar o atraso exponencial entre tentativas', async () => {
      let contadorChamadas = 0;
      const timestamps: number[] = [];

      class ClasseTeste {
        @Retry(3, 100)
        async metodoTesteAtraso() {
          timestamps.push(Date.now());
          contadorChamadas++;
          if (contadorChamadas < 3) {
            throw new Error(`Tentativa ${contadorChamadas} falhou`);
          }
          return 'sucesso';
        }
      }

      const instancia = new ClasseTeste();
      await instancia.metodoTesteAtraso();

      expect(timestamps.length).toBe(3);

      const primeiroAtraso = timestamps[1] - timestamps[0];
      expect(primeiroAtraso).toBeGreaterThanOrEqual(90);
      expect(primeiroAtraso).toBeLessThanOrEqual(120);

      const segundoAtraso = timestamps[2] - timestamps[1];
      expect(segundoAtraso).toBeGreaterThanOrEqual(190);
      expect(segundoAtraso).toBeLessThanOrEqual(220);
    });
  });

  describe('Parâmetros padrão', () => {
    it('deve usar valores padrão quando nenhum parâmetro é fornecido', async () => {
      let contadorChamadas = 0;

      class ClasseTeste {
        @Retry() // Sem parâmetros - deve usar padrões (3 tentativas, 1000ms)
        async metodoParametrosPadrao() {
          contadorChamadas++;
          if (contadorChamadas < 2) {
            throw new Error('Primeira tentativa falhou');
          }
          return 'sucesso';
        }
      }

      const instancia = new ClasseTeste();
      const inicio = Date.now();
      const resultado = await instancia.metodoParametrosPadrao();
      const duracao = Date.now() - inicio;

      expect(resultado).toBe('sucesso');
      expect(contadorChamadas).toBe(2);

      expect(duracao).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('Preservação de erro', () => {
    it('deve preservar os detalhes do erro original', async () => {
      class ErroCustomizado extends Error {
        constructor(
          message: string,
          public codigo: number,
        ) {
          super(message);
          this.name = 'ErroCustomizado';
        }
      }

      class ClasseTeste {
        @Retry(2, 10)
        async metodoErroCustomizado() {
          throw new ErroCustomizado('Mensagem de erro customizada', 500);
        }
      }

      const instancia = new ClasseTeste();

      try {
        await instancia.metodoErroCustomizado();
        fail('Deveria ter lançado erro');
      } catch (erro) {
        expect(erro).toBeInstanceOf(ErroCustomizado);
        expect(erro.message).toBe('Mensagem de erro customizada');
        expect((erro as ErroCustomizado).codigo).toBe(500);
      }
    });
  });

  describe('Preservação do contexto do método', () => {
    it('deve preservar o contexto "this" nas chamadas do método', async () => {
      class ClasseTeste {
        private valor = 'valor-teste';

        @Retry(2, 10)
        async metodoContexto() {
          return this.valor;
        }
      }

      const instancia = new ClasseTeste();
      const resultado = await instancia.metodoContexto();

      expect(resultado).toBe('valor-teste');
    });

    it('deve preservar os argumentos do método', async () => {
      class ClasseTeste {
        @Retry(2, 10)
        async metodoArgumentos(arg1: string, arg2: number, arg3: object) {
          return { arg1, arg2, arg3 };
        }
      }

      const instancia = new ClasseTeste();
      const objetoTeste = { chave: 'valor' };
      const resultado = await instancia.metodoArgumentos(
        'teste',
        123,
        objetoTeste,
      );

      expect(resultado).toEqual({
        arg1: 'teste',
        arg2: 123,
        arg3: objetoTeste,
      });
    });
  });
});
