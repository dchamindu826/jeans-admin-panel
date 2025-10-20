// frontend/src/admin_panel/components/ConfirmationModal.jsx

import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

// --- Modal (Popup) Styles ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Anit modal valaṭa vadiyen udin */
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 2rem;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  color: ${(props) => (props.$type === 'delete' ? '#ff6b6b' : '#f0ad4e')};
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const Message = styled.p`
  color: #555;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 2rem;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  flex: 1; /* Dekama sama paḷala */
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
  
  /* Palamu (Confirm) button eka */
  background-color: ${(props) => (props.$primary ? (props.$type === 'delete' ? '#ff6b6b' : '#007bff') : '#f1f1f1')};
  color: ${(props) => (props.$primary ? 'white' : '#555')};
  border: 1px solid ${(props) => (props.$primary ? (props.$type === 'delete' ? '#ff6b6b' : '#007bff') : '#ccc')};

  &:hover {
    opacity: 0.8;
  }
`;

/**
 * Props:
 * - show (boolean): Modal eka pennannaṭa
 * - onClose (function): "Cancel" click karapu viṭa
 * - onConfirm (function): "Confirm" click karapu viṭa
 * - title (string): Uda hiras
 * - message (string): Mæda paniviḍaya
 * - type (string): 'delete' (ratu paṭa danna) hō 'confirm' (nil paṭa)
 */
const ConfirmationModal = ({ show, onClose, onConfirm, title, message, type = 'confirm' }) => {
  if (!show) {
    return null;
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <IconWrapper $type={type}>
          <FaExclamationTriangle />
        </IconWrapper>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <ButtonWrapper>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button $primary $type={type} onClick={onConfirm}>
            {type === 'delete' ? 'Delete' : 'Confirm'}
          </Button>
        </ButtonWrapper>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmationModal;