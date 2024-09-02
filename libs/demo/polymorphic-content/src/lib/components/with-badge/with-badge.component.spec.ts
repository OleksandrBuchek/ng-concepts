import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WithBadgeComponent } from './with-badge.component';

describe('WithBadgeComponent', () => {
  let component: WithBadgeComponent;
  let fixture: ComponentFixture<WithBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WithBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
