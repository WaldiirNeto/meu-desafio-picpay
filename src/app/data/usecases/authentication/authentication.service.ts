import { Injectable } from '@angular/core';
import { Routes } from '@shared/helpers/router-helper';
import { AccountModel } from '@domain/models/account.model';
import {
  AuthenticationParams,
  IAuthentication
} from '@domain/usecases/authentication';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import ErrorResponseHelper from '@app/shared/helpers/error-response.helper';
import { ErrorEnum } from '@app/shared/helpers/errors-key.enum';
import { IHttpClient } from '@app/data/protocols/http-client';

@Injectable()
export class AuthenticationService implements IAuthentication {
  constructor(private readonly http: IHttpClient) {}
  auth(params: AuthenticationParams): Observable<AccountModel> {
    return this.http.get<AccountModel[]>(Routes.getUser).pipe(
      map((users: any) => {
        const findUser = users.find(
          (user) =>
            user.email === params.email && user.password === params.password
        );
        if (findUser) {
          return findUser;
        } else {
          throw new ErrorResponseHelper(ErrorEnum.userNotFound, 404);
        }
      })
    );
  }
}
