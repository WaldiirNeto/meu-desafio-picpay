import { HttpErrorResponse } from '@angular/common/http';
import { Component, SkipSelf } from '@angular/core';
import { Router } from '@angular/router';
import { AccountModel } from '@app/domain/models/account.model';
import { IAuthentication } from '@app/domain/usecases/authentication';
import { ILocalStorage } from '@app/infra/cache/interfaces/ilocalstorage';
import { CredentialModel } from '@app/shared/forms-model/credential.model';
import ErrorResponseHelper from '@app/shared/helpers/error-response.helper';
import { ISnackBar } from '@app/shared/interfaces/isnackbar';
import { FormHelper } from '@shared/helpers/form.helper';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent extends FormHelper {
  private _loading = false;
  constructor(
    @SkipSelf() private readonly authenticationService: IAuthentication,
    @SkipSelf() private readonly snackBar: ISnackBar,
    @SkipSelf() private readonly router: Router,
    @SkipSelf() private readonly storage: ILocalStorage
  ) {
    super(new CredentialModel());
  }

  auth() {
    this._loading = true;
    this.authenticationService
      .auth(this.form.value)
      .pipe(
        finalize(() => {
          this._loading = false;
        })
      )
      .subscribe({
        next: (user: AccountModel) => {
          this.storage.set(user);
          this.router.navigate(['payments']);
        },
        error: (helpError: ErrorResponseHelper) => {
          const { message } = helpError.error.error;
          this.snackBar.openSnackBar(message, 'error');
        }
      });
  }
  get loading(): boolean {
    return this._loading;
  }
}
