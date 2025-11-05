import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferDetails } from './offer-details';

describe('OfferDetails', () => {
  let component: OfferDetails;
  let fixture: ComponentFixture<OfferDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
