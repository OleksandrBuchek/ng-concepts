import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WithIconComponent } from './with-icon.component';

describe('WithIconComponent', () => {
  let component: WithIconComponent;
  let fixture: ComponentFixture<WithIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WithIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
