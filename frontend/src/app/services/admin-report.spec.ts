import { TestBed } from '@angular/core/testing';

import { AdminReport } from './admin-report';

describe('AdminReport', () => {
  let service: AdminReport;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminReport);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
