import { TestBed } from '@angular/core/testing';

import { Offer } from './offer';

describe('Offer', () => {
  let service: Offer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Offer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
