// frontend/src/admin_panel/pages/AdminCustomers.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { client, urlFor } from '../../client';
import { FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import DefaultUserImage from '../../components/UI/DefaultUserImage';

// --- Styled Components ---

const PageWrapper = styled.div`
  width: 100%;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #0A2540;
  margin-bottom: 1rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const AddButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const CustomerList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const CustomerCard = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  transition: all 0.2s ease-in-out;
  
  /* Click karana bava hængvīmaṭa */
  cursor: pointer;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-3px);
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-grow: 1; /* Itiri ida gænīmaṭa */
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #0A2540;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  /* Card eka click karanakōṭa button click novenna */
  z-index: 10; 
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #555;
  transition: color 0.2s;

  &:hover {
    color: ${(props) => (props.$delete ? '#ff4757' : '#007bff')};
  }
`;

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
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #aaa;
  cursor: pointer;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
  }

  label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #333;
  }
`;

const SubmitButton = styled(AddButton)`
  width: 100%;
  justify-content: center;
  margin-top: 1rem;
  
  &:disabled {
    background-color: #aaa;
  }
`;

// --- Component Eka ---
const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form eka sandahā state
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    image: null, // Image asset eka
  });
  
  // Edit kirīma sandahā
  const [editingCustomer, setEditingCustomer] = useState(null);

  const navigate = useNavigate();

  // Data fetch kirīma
  const fetchCustomers = async () => {
    setLoading(true);
    const query = '*[_type == "customer"] | order(name asc)';
    try {
      const data = await client.fetch(query);
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Page eka load venakōṭa data ganna
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Form eke dē venas kirīma
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image upload kirīma
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      client.assets
        .upload('image', file, {
          contentType: file.type,
          filename: file.name,
        })
        .then((document) => {
          setFormData((prev) => ({ ...prev, image: document }));
          setIsUploading(false);
        })
        .catch((error) => {
          console.error('Image upload failed:', error);
          setIsUploading(false);
        });
    }
  };

  // Form eka clear kirīma
  const clearForm = () => {
    setFormData({ name: '', contactPerson: '', phone: '', image: null });
    setEditingCustomer(null);
  };

  // Modal eka vahanakōṭa
  const closeModal = () => {
    setIsModalOpen(false);
    clearForm();
  };

  // Form eka Submit kirīma (Alut / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return; // Namaya anivāryayi

    setLoading(true);

    const doc = {
      _type: 'customer',
      name: formData.name,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      ...(formData.image && {
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: formData.image._id,
          },
        },
      }),
    };
    
    try {
      if (editingCustomer) {
        // --- Edit Kirīma ---
        await client.patch(editingCustomer._id).set(doc).commit();
      } else {
        // --- Alutin Add Kirīma ---
        await client.create(doc);
      }
      closeModal();
      fetchCustomers(); // List eka refresh karanna
    } catch (error) {
      console.error('Failed to save customer:', error);
      setLoading(false);
    }
  };

  // Edit Button eka click kirīma
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      contactPerson: customer.contactPerson || '',
      phone: customer.phone || '',
      image: customer.image ? customer.image.asset : null,
    });
    setIsModalOpen(true);
  };
  
  // Delete Button eka click kirīma
  const handleDelete = async (customerId) => {
    // Oba illū confirmation eka
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this customer?'
    );
    
    if (isConfirmed) {
      setLoading(true);
      try {
        await client.delete(customerId);
        fetchCustomers(); // List eka refresh karanna
      } catch (error) {
        console.error('Failed to delete customer:', error);
        setLoading(false);
      }
    }
  };

  // Card eka click karapu vita, Invoice piṭuvaṭa yāma
  const handleCardClick = (customerId) => {
    navigate(`/admin/invoices/${customerId}`);
  };

  if (loading && customers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <PageWrapper>
      <TopBar>
        <PageTitle>Manage Customers</PageTitle>
        <AddButton onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Add New Customer
        </AddButton>
      </TopBar>

      {/* Customer List Eka */}
      <CustomerList>
        {customers.map((customer) => (
          <CustomerCard key={customer._id}>
            <CustomerInfo onClick={() => handleCardClick(customer._id)}>
              <DefaultUserImage customer={customer} size="50px" />
              <div>
                <h3>{customer.name}</h3>
                {customer.contactPerson && <p>{customer.contactPerson}</p>}
              </div>
            </CustomerInfo>
            
            <ActionButtons>
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation(); // Card eka click vena eka navatvanna
                  handleEdit(customer);
                }}
              >
                <FaEdit />
              </IconButton>
              <IconButton 
                $delete
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(customer._id);
                }}
              >
                <FaTrash />
              </IconButton>
            </ActionButtons>
          </CustomerCard>
        ))}
      </CustomerList>

      {/* --- Add / Edit Modal Eka --- */}
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeModal}><FaTimes /></CloseButton>
            <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
            
            <Form onSubmit={handleSubmit}>
              <label>Customer Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. Brandix"
                required
              />
              
              <label>Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleFormChange}
                placeholder="e.g. Mr. Silva"
              />
              
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="e.g. 0771234567"
              />
              
              <label>Customer Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              
              {/* Image eka upload venakota hō preview eka pennanna */}
              {isUploading && <p>Uploading image...</p>}
              {formData.image && !isUploading && (
                <div>
                  <p>Image Preview:</p>
                  <img 
                    src={urlFor(formData.image).width(100).url()} 
                    alt="Preview" 
                    style={{ borderRadius: '8px', height: '100px' }}
                  />
                </div>
              )}

              <SubmitButton type="submit" disabled={loading || isUploading}>
                {loading ? 'Saving...' : (editingCustomer ? 'Save Changes' : 'Add Customer')}
              </SubmitButton>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default AdminCustomers;