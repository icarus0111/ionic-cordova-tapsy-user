import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterResidentialLocksmithComponent } from './register-residential-locksmith.component';

describe('RegisterResidentialLocksmithComponent', () => {
  let component: RegisterResidentialLocksmithComponent;
  let fixture: ComponentFixture<RegisterResidentialLocksmithComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterResidentialLocksmithComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterResidentialLocksmithComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
