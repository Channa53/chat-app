import { QueryClientProvider } from '@tanstack/react-query';
import { type FC } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/layout/app-layout';
import { AdminPage } from '@/components/pages/admin-page';
import { ChatPage } from '@/components/pages/chat-page';
import { LoginPage } from '@/components/pages/login-page';
import { RegisterPage } from '@/components/pages/register-page';
import { queryClient } from '@/utils/query-client';

export const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<AppLayout />}>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
