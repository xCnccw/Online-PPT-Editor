import React from 'react';
import { createBrowserRouter,Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import CardList from '../components/CardList'
import EditCard from '../components/EditCard'
import RouterAuth from './RouterAuth.jsx';
import PreviewPage from '../pages/PreviewPage.jsx'; 

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <RouterAuth>
        <DashboardPage />
      </RouterAuth>
    ),
    children: [
      {
        path: "", 
        element: <CardList />,
      },
      {
        path: "edit/:presentationId", 
        element: <EditCard />,
      },
    ],
  },
  {
    path: "/preview/:presentationId",
    element: (
      <RouterAuth>
        <PreviewPage />
      </RouterAuth>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />, //redirect
  },
]);

export default router;
