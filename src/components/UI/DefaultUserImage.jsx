// frontend/src/components/UI/DefaultUserImage.jsx

import React from 'react';
import styled from 'styled-components';
import { urlFor } from '../../client'; // Sanity image URL builder

const AvatarWrapper = styled.div`
  width: ${(props) => props.$size || '50px'};
  height: ${(props) => props.$size || '50px'};
  border-radius: 50%;
  background-color: #007bff; /* Nil */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(props) => (parseInt(props.$size) / 2 || 25) + 'px'};
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0; /* Resize venakota podi novenna */
`;

const Img = styled.img`
  width: ${(props) => props.$size || '50px'};
  height: ${(props) => props.$size || '50px'};
  border-radius: 50%;
  object-fit: cover;
`;

/**
 * Props:
 * - customer: { name: '...', image: {...} }
 * - size: '60px' (optional)
 */
const DefaultUserImage = ({ customer, size }) => {
  if (customer && customer.image) {
    return (
      <Img
        src={urlFor(customer.image).width(parseInt(size) || 50).url()}
        alt={customer.name}
        $size={size}
      />
    );
  }
  
  // Namē mul akura gænīma
  const firstLetter = (customer && customer.name)
    ? customer.name.charAt(0)
    : '?';
  
  return (
    <AvatarWrapper $size={size}>
      {firstLetter}
    </AvatarWrapper>
  );
};

export default DefaultUserImage;