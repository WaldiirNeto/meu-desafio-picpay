import { Observable } from 'rxjs';
import { AccountModel } from '../models/account.model';

export type AuthenticationParams = {
  email: string;
  password: string;
};
export interface IAuthentication {
  auth(params: AuthenticationParams): Observable<AccountModel[]>;
}