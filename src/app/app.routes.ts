import { Routes } from '@angular/router';
import { Error } from './error/error';
import { Chat } from './chat/chat';
import { Main } from './main/main';
import { TechnicalReport } from './technical-report/technical-report';

export const routes: Routes = [
    {path: '', redirectTo:'/main', pathMatch: 'full'},
    {path: 'main', title:"Welcome to Hydra", component:Main},
    {path:'chat', title:'Hydra /chat', component:Chat},
    {path:'technical_report', title:'Hydra /technical_report', component:TechnicalReport },
    {path:'**', title:'error', component:Error}
];
