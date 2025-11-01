import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartBarter } from './start-barter';

describe('StartBarter', () => {
  let component: StartBarter;
  let fixture: ComponentFixture<StartBarter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartBarter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartBarter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
