// frontend/src/admin_panel/components/Sidebar.jsx

import React from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaFileInvoice, 
  FaTruck, 
  FaUserCircle, 
  FaCog, 
  FaSignOutAlt,
  FaIndustry // Company icon
} from 'react-icons/fa';

// Sidebar eke mulu container eka
const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #0A2540; // Tada Nil (Main Color)
  color: #FFFFFF; // Sudu Akuru
`;

// Udama Company Name eka
const LogoContainer = styled.div`
  padding: 1.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid #1a3a5e; // Lā nil separator
  
  svg {
    font-size: 2rem;
    color: #007bff; // Icon ekaṭa highlight color ekak
  }
  
  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  /* Mobile valadi name eka sangavanna */
  @media (max-width: 768px) {
    h1 {
      display: none;
    }
    justify-content: center;
  }
`;

// Navigation link tiyena kotasa
const NavMenu = styled.nav`
  flex-grow: 1; /* Itiri ida siyalla ganna */
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
`;

// Eka eka link eka sandahā (styled-components vitarak bavita karana nisa NavLink mehema style karamu)
const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #aeb9c5; // Lā alu paṭa akuru
  text-decoration: none;
  font-size: 1rem;
  gap: 15px; // Icon eka saha text eka atara ida
  transition: all 0.2s ease-in-out;

  svg {
    font-size: 1.25rem;
    min-width: 25px; // Icons tika eka pēliyaṭa tiyanna
  }

  /* Link eka hoover karanakōṭa */
  &:hover {
    background-color: #1a3a5e; // Lā nil hover
    color: #FFFFFF; // Sudu karanna
  }

  /* Active (tōrāgena sitina) link eka */
  &.active {
    background-color: #007bff; // Pradhāna Nil Paṭa
    color: #FFFFFF;
    font-weight: 600;
    border-right: 4px solid #FFFFFF; // Active eka dænvīmaṭa
  }

  /* Mobile valadi text eka sangavanna */
  @media (max-width: 768px) {
    span {
      display: none;
    }
    justify-content: center;
    padding: 1rem;
  }
`;

// Pahaḷama tiyena Sign Out Button eka
const SignOutButton = styled.button`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-top: 1px solid #1a3a5e; // Uda separator
  color: #ff6b6b; // Ratu paṭa
  font-size: 1rem;
  width: 100%;
  cursor: pointer;
  gap: 15px;
  transition: all 0.2s ease-in-out;

  svg {
    font-size: 1.25rem;
    min-width: 25px;
  }

  &:hover {
    background-color: #1a3a5e;
    color: #ff4757; // Tadin Ratu
  }
  
  /* Mobile valadi */
  @media (max-width: 768px) {
    span {
      display: none;
    }
    justify-content: center;
    padding: 1rem;
  }
`;

const Sidebar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Confirmation eka ahanna
    const isConfirmed = window.confirm("Are you sure you want to sign out?");
    if (isConfirmed) {
      localStorage.removeItem('jeansFactoryAdmin'); // Admin details ayin karanna
      navigate('/admin/login'); // Login page ekaṭa yomu karanna
    }
  };

  return (
    <SidebarWrapper>
      <LogoContainer>
        <FaIndustry />
        <h1>Jeans Factory</h1>
      </LogoContainer>

      <NavMenu>
        <StyledNavLink to="/admin/dashboard">
          <FaTachometerAlt /> <span>Dashboard</span>
        </StyledNavLink>
        
        <StyledNavLink to="/admin/customers">
          <FaUsers /> <span>Customers</span>
        </StyledNavLink>

        {/* Mē tika passe hadanakam comment karala tiyanna puluvan */}
        <StyledNavLink to="/admin/invoices-all" style={{ opacity: 0.5, pointerEvents: 'none' }}>
          <FaFileInvoice /> <span>All Invoices</span>
        </StyledNavLink>
        
        <StyledNavLink to="/admin/suppliers" style={{ opacity: 0.5, pointerEvents: 'none' }}>
          <FaTruck /> <span>Suppliers</span>
        </StyledNavLink>

        <StyledNavLink to="/admin/accounts" style={{ opacity: 0.5, pointerEvents: 'none' }}>
          <FaUserCircle /> <span>Accounts</span>
        </StyledNavLink>
      </NavMenu>

      {/* Settings saha Sign Out pahaḷinma tiyanna */}
      <div>
        <StyledNavLink to="/admin/settings">
          <FaCog /> <span>Settings</span>
        </StyledNavLink>
        <SignOutButton onClick={handleSignOut}>
          <FaSignOutAlt /> <span>Sign Out</span>
        </SignOutButton>
      </div>
    </SidebarWrapper>
  );
};

// *********** VÆDAGATHMA KOTASA ***********
// Mē file eken 'default' ekak vidiyata Sidebar eka export kirīma
export default Sidebar;