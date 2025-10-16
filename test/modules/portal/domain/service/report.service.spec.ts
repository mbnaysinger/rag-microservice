import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from '../../../../../src/modules/portal/domain/service/report.service';
import { ReportAdapter } from '../../../../../src/modules/portal/infrastructure/repositories/report.repository';
import {
  ReportModel,
  ReportSentiment,
} from '../../../../../src/modules/portal/domain/model/report.model';

describe('ReportService', () => {
  let service: ReportService;
  let mockReportAdapter: jest.Mocked<ReportAdapter>;

  beforeEach(async () => {
    const mockAdapter = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: ReportAdapter,
          useValue: mockAdapter,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    mockReportAdapter = module.get(ReportAdapter);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar um report com sucesso', async () => {
    const reportModel = ReportModel.builder()
      .withComment('Teste de feedback')
      .withSentiment(ReportSentiment.POSITIVE)
      .withTracking('TRACK123')
      .withUserId('peterson.paloschi')
      .withCreatedBy('peterson.paloschi')
      .withUpdatedBy('peterson.paloschi')
      .withVersion(0)
      .build();

    const expectedReport = ReportModel.builder()
      .withId('report123')
      .withComment('Teste de feedback')
      .withSentiment(ReportSentiment.POSITIVE)
      .withTracking('TRACK123')
      .withUserId('peterson.paloschi')
      .withCreatedBy('peterson.paloschi')
      .withUpdatedBy('peterson.paloschi')
      .withVersion(0)
      .build();

    mockReportAdapter.save.mockResolvedValue(expectedReport);

    const result = await service.create(reportModel);

    expect(mockReportAdapter.save).toHaveBeenCalledWith(reportModel);
    expect(result).toEqual(expectedReport);
  });
});
