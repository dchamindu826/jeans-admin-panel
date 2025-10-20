// frontend/src/admin_panel/components/StatsCard.jsx
// (FIXED: Removed ellipsis '...' to show full amount)

import React from 'react';
import styled from 'styled-components';

const CardWrapper = styled.div`
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.2s ease-in-out;
  overflow: hidden; 

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
`;

const IconWrapper = styled.div`
  font-size: 2rem;
  padding: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  color: ${(props) => props.$color || '#007bff'};
  background-color: ${(props) => props.$bg || '#F0F8FF'};
`;

const InfoWrapper = styled.div`
  flex: 1;
  min-width: 0; 

  h3 {
    margin: 0;
    font-size: 1rem;
    color: #555;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  p {
    margin: 0;
    /* --- *** CARD AMOUNT FIX (NO '...') *** --- */
    font-size: 1.7rem; /* 1.6rem සිට 1.7rem දක්වා වැඩි කළා (ඉඩ ඇති නිසා) */
    color: #0A2540; 
    font-weight: 700;
    
    white-space: nowrap; /* අගය කැඩීම වැළැක්වීමට (Force single line) */
    /* overflow: hidden; සහ text-overflow: ellipsis; ඉවත් කළා */

    /* Mobile (1-column layout) eke nowrap අවශ්‍ය නැහැ */
    @media (max-width: 767px) {
      font-size: 1.5rem; 
      white-space: normal; /* Mobile wala break වීමට ඉඩ දෙන්න */
    }
    /* ---------------------------------- */
  }
`;

const StatsCard = ({ title, value, icon, color, $bg }) => {
  return (
    <CardWrapper>
      <IconWrapper $color={color} $bg={$bg}>
        {icon}
      </IconWrapper>
      <InfoWrapper>
        <h3>{title}</h3>
        <p>{value}</p>
      </InfoWrapper>
    </CardWrapper>
  );
};

export default StatsCard;