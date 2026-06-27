import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AppLayout from '../layouts/AppLayout';

import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Friends from '../pages/Friends';
import CreateFriend from '../pages/CreateFriend';
import Groups from '../pages/Groups';
import CreateGroup from '../pages/CreateGroup';
import CreateExpense from '../pages/CreateExpense';
import ExpenseDetails from '../pages/ExpenseDetails';
import Notifications from '../pages/Notifications';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import PaymentHistory from '../pages/PaymentHistory';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes (Login, OTP, Profile Registration) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Protected Routes (Require active session) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/friends/new" element={<CreateFriend />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/new" element={<CreateGroup />} />
          <Route path="/expenses/new" element={<CreateExpense />} />
          <Route path="/expenses/:id" element={<ExpenseDetails />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
        </Route>
      </Route>

      {/* Fallback to Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
