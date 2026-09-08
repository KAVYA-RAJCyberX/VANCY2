import { Navigate, Outlet } from 'react-router';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminProtectedRouteProps {
  roles?: string[];
  permissions?: string[];
}

export function AdminProtectedRoute({ roles, permissions }: AdminProtectedRouteProps) {
  const { currentAdmin, loading, hasRole, hasPermission } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-px w-32 bg-border relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-full bg-foreground transform -translate-x-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
        </div>
      </div>
    );
  }

  if (!currentAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check roles
  if (roles && roles.length > 0) {
    if (!hasRole(roles)) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col gap-4">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-gray-500">You don't have the required role to view this page.</p>
        </div>
      );
    }
  }

  // Check permissions
  if (permissions && permissions.length > 0) {
    const hasRequiredPermission = permissions.some(p => hasPermission(p));
    if (!hasRequiredPermission) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col gap-4">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-gray-500">You don't have the required permission to view this page.</p>
        </div>
      );
    }
  }

  return <Outlet />;
}
