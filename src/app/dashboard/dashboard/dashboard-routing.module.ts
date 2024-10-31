import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreditComponent } from '../credit/credit.component';
import { DebitComponent } from '../debit/debit.component';
import { TransactionHistoryComponent } from '../transaction-history/transaction-history.component';
import { DashboardComponent } from './dashboard.component';


const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'credit', component: CreditComponent },
  { path: 'debit', component: DebitComponent },
  { path: 'transaction-history', component: TransactionHistoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardModule { }
