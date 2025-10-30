import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsPrivacy } from './terms-privacy';

describe('TermsPrivacy', () => {
  let component: TermsPrivacy;
  let fixture: ComponentFixture<TermsPrivacy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsPrivacy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsPrivacy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
