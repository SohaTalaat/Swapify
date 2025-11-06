import { TestBed } from '@angular/core/testing';

import { IdVerification } from './id-verification';

describe('IdVerification', () => {
  let service: IdVerification;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IdVerification);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
