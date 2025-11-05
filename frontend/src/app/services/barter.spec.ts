import { TestBed } from '@angular/core/testing';

import { Barter } from './barter';

describe('Barter', () => {
  let service: Barter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Barter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
