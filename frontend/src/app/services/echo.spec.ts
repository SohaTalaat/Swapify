import { TestBed } from '@angular/core/testing';

import { Echo } from './echo';

describe('Echo', () => {
  let service: Echo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Echo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
