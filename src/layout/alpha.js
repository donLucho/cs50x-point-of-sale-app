import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // v6

import { Main } from "./main";
import { LoginPage } from '../components/pages/Login';
import { RegisterPage } from '../components/pages/Register';
import { DNEPage } from '../components/pages/DNE';
import { AdminPos } from '../components/pages/Pos';
import { AdminInventory } from '../components/pages/Inventory';
import { AdminTransactions } from '../components/pages/Transactions';
import { AdminLiveCart } from '../components/pages/LiveCart';
import { AdminViewTransaction } from '../components/pages/ViewTransaction';
import { AdminViewProduct } from '../components/pages/ViewProduct';

const Alpha = () => {
  const element = (
    <BrowserRouter>
      <Main>
        <Routes>
          <Route path="/" element={ <AdminPos/> } />
          <Route path="/inventory" element={ <AdminInventory/> } />
          <Route path="/transactions" element={ <AdminTransactions/> } />
          <Route path="/livecart" element={ <AdminLiveCart/> } />
          <Route path="/transaction/:id" element={ <AdminViewTransaction/> } />
          <Route path="/product/:id" element={ <AdminViewProduct/> } />
          <Route path="/login" element={ <LoginPage/> } />
          <Route path="/register" element={ <RegisterPage/> } />
          <Route path="*" element={ <DNEPage /> } /> 
        </Routes>
      </Main>
    </BrowserRouter>
  );
  return element;
};

export {Alpha};
