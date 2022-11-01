import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartedJobComponent } from './started-job.component';

describe('StartedJobComponent', () => {
  let component: StartedJobComponent;
  let fixture: ComponentFixture<StartedJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartedJobComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartedJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
