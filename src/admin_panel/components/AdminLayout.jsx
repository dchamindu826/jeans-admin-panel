import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useIdleTimer } from 'react-idle-timer';
import Sidebar from './Sidebar'; // Api meka passe hadamu

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const SidebarContainer = styled.div`
  width: 250px; /* Sidebar eke paḷaḷa */
  background-color: #0A2540; /* Tada Nil Paṭa */
  color: white;
  position: fixed;
  height: 100%;
  
  @media (max-width: 768px) {
    width: 60px; /* Mobile valadi podi karanna */
  }
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  margin-left: 250px; /* Sidebar eke paḷaḷaṭa sama venna ona */
  padding: 2rem;
  background-color: #F0F8FF; /* Lā Nil Paṭa (AliceBlue) */

  @media (max-width: 768px) {
    margin-left: 60px; /* Mobile valadi */
    padding: 1rem;
  }
`;

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleOnIdle = (event) => {
    console.log('User is idle, logging out...');
    // Admin details local storage eken ayin karanna
    localStorage.removeItem('jeansFactoryAdmin');
    // Login page ekaṭa yomu karanna
    navigate('/admin/login');
  };

  useIdleTimer({
    timeout: 1000 * 60 * 5, // Vinadi 5 (milliseconds)
    onIdle: handleOnIdle,
    debounce: 500,
  });

  return (
    <LayoutContainer>
      <SidebarContainer>
        {/* Sidebar eka mehī dāmu */}
        <Sidebar />
      </SidebarContainer>
      
      <ContentContainer>
        {/* Anit pages (Dashboard, Customers) mehī pennanava */}
        <Outlet /> 
      </ContentContainer>
    </LayoutContainer>
  );
};

export default AdminLayout;