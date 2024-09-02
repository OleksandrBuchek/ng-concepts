import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WithTooltipComponent } from './with-tooltip.component';

describe('WithTooltipComponent', () => {
  let component: WithTooltipComponent;
  let fixture: ComponentFixture<WithTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithTooltipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WithTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
