import { Component, Input, OnDestroy, OnInit, SkipSelf } from '@angular/core';
import { NotificationService } from '@shared/services/notification.service';
import { AddPaymentModel } from '@shared/forms-model/add-payment.model';
import { FormHelper } from '@shared/helpers/form.helper';
import { MatDialog } from '@angular/material/dialog';
import { ISnackBar } from '@app/shared/interfaces/isnackbar';
import { IPayment } from '@app/domain/usecases/payments';
import { finalize } from 'rxjs/operators';
import { PaymentModel } from '@app/domain/models/payment.model';
import { translate } from '@ngneat/transloco';
@Component({
  selector: 'app-payment-modal',
  templateUrl: 'add-payment-modal.component.html',
  styleUrls: ['add-payment-modal.component.scss']
})
export class AddPaymentModalComponent
  extends FormHelper
  implements OnInit, OnDestroy
{
  @Input() payment: PaymentModel;
  private _loading = false;
  constructor(
    @SkipSelf() private readonly notification: NotificationService,
    @SkipSelf() private readonly dialogRef: MatDialog,
    @SkipSelf() private readonly toast: ISnackBar,
    @SkipSelf() private readonly paymentsService: IPayment
  ) {
    super(new AddPaymentModel());
  }

  ngOnInit(): void {
    this.form.patchValue(this.payment);
    this.mappingData();
  }
  public request(): void {
    if (!this.payment) {
      this.onSave();
    } else {
      this.onEdit();
    }
  }
  public onSave(): void {
    this._loading = true;
    this.paymentsService
      .addPayment(this.form.value)
      .pipe(
        finalize(() => {
          this._loading = false;
        })
      )
      .subscribe(() => {
        this.dialogRef.closeAll();
        this.notification.notify();
        this.toast.openSnackBar('payments.message.success', 'success');
      });
  }

  public onEdit(): void {
    this._loading = true;
    this.paymentsService
      .editPayment(this.payment.id, this.form.value)
      .pipe(
        finalize(() => {
          this._loading = false;
        })
      )
      .subscribe(() => {
        this.dialogRef.closeAll();
        this.notification.notify();
        this.toast.openSnackBar('payments.message.edit', 'success');
      });
  }
  ngOnDestroy(): void {
    this.payment = undefined;
  }
  private mappingData(): void {
    if (this.payment) {
      const d = new Date(this.payment.date);
      const datestring =
        d.getFullYear().toString() +
        '-' +
        (d.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        d.getDate().toString().padStart(2, '0');
      this.form.controls.date.setValue(datestring);
    }
  }
  get loading(): boolean {
    return this._loading;
  }

  get title(): string {
    if (!this.payment) {
      return translate('payments.modal.add_payment');
    }
    return translate('payments.modal.edit_payment');
  }
}
