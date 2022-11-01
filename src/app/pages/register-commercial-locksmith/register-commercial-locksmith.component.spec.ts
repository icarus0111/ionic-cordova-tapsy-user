import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCommercialLocksmithComponent } from './register-commercial-locksmith.component';

describe('RegisterCommercialLocksmithComponent', () => {
  let component: RegisterCommercialLocksmithComponent;
  let fixture: ComponentFixture<RegisterCommercialLocksmithComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterCommercialLocksmithComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterCommercialLocksmithComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
