import { TestBed } from '@angular/core/testing';

import { Recommendations } from './recommendations';

describe('Recommendations', () => {
  let service: Recommendations;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Recommendations);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
