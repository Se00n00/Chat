import { Routes } from '@angular/router';
import { Error } from './error/error';
import { Chat } from './chat/chat';
import { TechnicalReport } from './technical-report/technical-report';

export const routes: Routes = [
    {path: '', redirectTo:'/chat', pathMatch: 'full'},
    {path:'chat', title:'Hydra /chat', component:Chat},
    {path:'technical_report', title:'Hydra /technical_report', component:TechnicalReport },
    {path:'**', title:'error', component:Error}
];
