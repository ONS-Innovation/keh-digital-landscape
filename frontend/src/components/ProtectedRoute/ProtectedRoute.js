import React, { useEffect, useState } from 'react';
import { useData } from '../../contexts/dataContext';
import AccessDenied from '../AccessDenied/AccessDenied';
import Header from '../Header/Header';

/**
 * ProtectedRoute component that checks user permissions before rendering content
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The component to render if user has access
 * @param {string[]} props.requiredRoles - Array of roles that can access this route
 * @param {string} props.pageName - Name of the page for access denied message
 */
const ProtectedRoute = ({ children, requiredRoles, pageName }) => {
  const { getUserData } = useData();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userData = await getUserData();
        setUser(userData);

        if (!userData?.user?.groups || userData.user.groups.length === 0) {
          setHasAccess(false);
        } else {
          // Check if user has any of the required roles
          const userGroups = userData.user.groups;
          const hasRequiredRole = requiredRoles.some(role =>
            userGroups.includes(role)
          );
          setHasAccess(hasRequiredRole);
        }
      } catch (error) {
        console.error('Failed to check user access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [getUserData, requiredRoles]);

  if (!hasAccess) {
    return (
      <>
        <Header
          searchTerm=""
          onSearchChange={() => {}}
          searchResults={[]}
          onSearchResultClick={() => {}}
          hideSearch={true}
        />
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <AccessDenied
            pageName={pageName}
            userEmail={user?.user?.email}
            userGroups={user?.user?.groups || []}
            requiredRoles={requiredRoles}
            isDevelopmentMode={user?.development_mode}
          />
        )}
      </>
    );
  }

  return children;
};

export default ProtectedRoute;
