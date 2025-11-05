import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseOffers } from './browse-offers';

describe('BrowseOffers', () => {
  let component: BrowseOffers;
  let fixture: ComponentFixture<BrowseOffers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseOffers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseOffers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
