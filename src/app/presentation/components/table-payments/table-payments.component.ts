import { Component, OnInit, SkipSelf } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NotificationService } from '@app/shared/services/notification.service';
import { PaymentModel } from '@domain/models/payment.model';
import { IPayment } from '@domain/usecases/payments';
import { MatPaginatorInterface } from '@shared/interfaces/mat-pagination-event.interface';
import { filter, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-table-payments',
  templateUrl: 'table-payments.component.html',
  styleUrls: ['table-payments.component.scss']
})
export class TablePaymentsComponent implements OnInit {
  public dataSource: MatTableDataSource<PaymentModel>;
  public direction = 'ASC';
  public orderBy = 'id';
  public lastOrderBy = 'id';

  public displayedColumns: string[] = [

    'title',
    'date',
    'value',
    'isPayed',
    'actions'
  ];
  public checked = { check: false, id: 0 };

  public currentPage = 0;
  public totalCount: number;

  public filter: any;
  public filterName: any;
  public pagination = { _page: this.currentPage, _limit: 10 };
  private _loading = true;

  constructor(
    @SkipSelf() private readonly paymentService: IPayment,
    @SkipSelf() private notification: NotificationService
  ) {}

  ngOnInit() {
    this.getPayments();
    this.awaitNotification();
  }
  public getPayments() {
    this._loading = true;
    this.paymentService
      .get(this.prepareRequest())
      .pipe(
        finalize(() => {
          this._loading = false;
        })
      )
      .subscribe((list: { totalCount: number; user: PaymentModel[] }) => {
        this.dataSource = new MatTableDataSource(list.user);
        this.totalCount = list.totalCount;
      });
  }
  public setFilterName(nameFilter: string) {
    this.filterName = nameFilter;
    this.getPayments();
  }

  public setPagination(page: MatPaginatorInterface) {
    this.pagination._page = page.pageIndex;
    this.pagination._limit = page.pageSize;
    this.getPayments();
  }
  public sortTable(option) {
    if (this.direction === 'ASC' && this.lastOrderBy === option) {
      this.direction = 'DESC';
    } else {
      this.direction = 'ASC';
    }
    this.orderBy = option;
    this.lastOrderBy = option;
    this.getPayments();
  }
  private prepareRequest() {
    const obj = {
      ...(this.filter === undefined ? '' : this.filter),
      ...this.pagination,
      _sort: this.orderBy,
      _order: this.direction,
      ...(this.filterName === undefined ? '' : this.filterName)
    };
    return new URLSearchParams(obj)
      .toString()
      .replace(/%3A/g, ':')
      .replace(/%2C/g, ',');
  }

  private awaitNotification() {
    this.notification.observerNotification
      .pipe(filter((x) => x === true))
      .subscribe((_) => this.getPayments());
  }
  get loading() {
    return this._loading;
  }
}
