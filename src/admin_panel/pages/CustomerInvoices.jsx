// frontend/src/admin_panel/pages/CustomerInvoices.jsx
// (ERROR FREE)

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { client } from '../../client';
import * as XLSX from 'xlsx'; 
import ReactPaginate from 'react-paginate';
import { 
  FaPlus, 
  FaFileExcel, 
  FaTimes, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaEdit,
  FaTrash 
} from 'react-icons/fa';

import LoadingSpinner from '../../components/UI/LoadingSpinner';
import DefaultUserImage from '../../components/UI/DefaultUserImage';
import ConfirmationModal from '../components/ConfirmationModal';

// --- Styled Components ---
const PageWrapper = styled.div` width: 100%; `;
const CustomerHeader = styled.div`
  display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem;
  background-color: #ffffff; border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); margin-bottom: 2rem;
`;
const CustomerName = styled.h1` font-size: 2rem; color: #0A2540; margin: 0; `;
const Toolbar = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
`;
const ActionButtons = styled.div` display: flex; gap: 1rem; `;
const Button = styled.button`
  background-color: ${(props) => (props.$primary ? '#007bff' : '#28a745')};
  color: white; border: none; border-radius: 5px;
  padding: 0.75rem 1.25rem; font-size: 0.9rem; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: background-color 0.2s;
  &:hover { opacity: 0.85; }
`;
const HiddenInput = styled.input` display: none; `;
const FilterButtons = styled.div`
  display: flex; gap: 0.5rem; background-color: #e9ecef;
  border-radius: 5px; padding: 5px;
`;
const FilterButton = styled.button`
  padding: 0.5rem 1rem; border: none; border-radius: 5px;
  font-weight: 600; cursor: pointer;
  background-color: ${(props) => (props.$active ? '#ffffff' : 'transparent')};
  color: ${(props) => (props.$active ? '#007bff' : '#555')};
  box-shadow: ${(props) => (props.$active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none')};
  transition: all 0.2s;
`;
const InvoiceTable = styled.table`
  width: 100%; border-collapse: collapse; background-color: #ffffff;
  border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #f1f1f1; }
  th { background-color: #f8f9fa; color: #555; font-size: 0.9rem; text-transform: uppercase; }
  tr:last-child td { border-bottom: none; }
  
  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
`;
const MarkPaidButton = styled.button`
  background: none; border: 1px solid #28a745; color: #28a745;
  padding: 5px 10px; border-radius: 5px; cursor: pointer;
  font-weight: 600; transition: all 0.2s;
  &:hover { background-color: #28a745; color: white; }
`;
const PaidStatus = styled.span`
  color: #28a745; font-weight: 600; display: flex;
  align-items: center; gap: 5px;
`;
const TableActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-width: 180px;
`;
const IconGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-left: auto; 
`;
const IconButton = styled.button`
  background: none; border: none; cursor: pointer;
  font-size: 1.1rem; color: #555; transition: color 0.2s;
  &:hover { color: ${(props) => (props.$delete ? '#ff4757' : '#007bff')}; }
`;
const PaginationWrapper = styled.div`
  margin-top: 2rem; display: flex; justify-content: center;
  .pagination {
    display: flex; list-style: none; padding: 0;
    li { margin: 0 5px;
      a { padding: 8px 12px; border-radius: 5px; color: #007bff; cursor: pointer; transition: all 0.2s;
        &:hover { background-color: #f0f8ff; }
      }
      &.selected a { background-color: #007bff; color: white; }
      &.disabled a { color: #ccc; cursor: not-allowed; }
    }
  }
`;
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background-color: white; border-radius: 10px; padding: 2rem;
  width: 90%; max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); position: relative;
`;
const CloseButton = styled.button`
  position: absolute; top: 1rem; right: 1rem; background: none;
  border: none; font-size: 1.5rem; color: #aaa; cursor: pointer;
`;
const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  .full-width { grid-column: 1 / -1; }
`;
const Input = styled.input`
  width: 100%; padding: 0.75rem 1rem; border: 1px solid #ccc;
  border-radius: 5px; font-size: 1rem;
`;
const Label = styled.label`
  font-weight: 600; font-size: 0.9rem; color: #333; margin-bottom: 5px;
  display: block;
`;
const SubmitButton = styled(Button)`
  width: 100%; justify-content: center; margin-top: 1rem;
  grid-column: 1 / -1;
  &:disabled { background-color: #aaa; }
`;

// --- Component Eka ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const ITEMS_PER_PAGE = 10;

const CustomerInvoices = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    styleNumber: '',
    quantity: '',
    totalAmount: '',
    remarks: '',
  });
  const [currentPage, setCurrentPage] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    const customerQuery = '*[_type == "customer" && _id == $customerId][0]';
    const invoicesQuery = '*[_type == "invoice" && customer._ref == $customerId] | order(_createdAt desc)';
    
    try {
      const custData = await client.fetch(customerQuery, { customerId });
      setCustomer(custData);
      const invData = await client.fetch(invoicesQuery, { customerId });
      setInvoices(invData);
    } catch (error) { console.error("Failed to fetch data:", error); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, [customerId]);

  const filteredInvoices = useMemo(() => {
    if (filter === 'paid') return invoices.filter(inv => inv.isPaid);
    if (filter === 'od') return invoices.filter(inv => !inv.isPaid);
    return invoices;
  }, [invoices, filter]);
  
  const totals = useMemo(() => {
    let od = 0;
    let paid = 0;
    invoices.forEach(inv => {
      const total = inv.totalAmount || 0;
      if (inv.isPaid) paid += total;
      else od += total;
    });
    return { od, paid };
  }, [invoices]);

  const pageCount = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = filteredInvoices.slice(offset, offset + ITEMS_PER_PAGE);
  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const handleMarkAsPaidClick = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsConfirmModalOpen(true);
  };
  const confirmMarkAsPaid = async () => {
    if (!selectedInvoiceId) return;
    setLoading(true);
    setIsConfirmModalOpen(false);
    try {
      await client.patch(selectedInvoiceId).set({ isPaid: true }).commit();
      setInvoices(prev => prev.map(inv => inv._id === selectedInvoiceId ? { ...inv, isPaid: true } : inv));
    } catch (error) { console.error("Failed to mark as paid:", error); }
    finally { setLoading(false); setSelectedInvoiceId(null); }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingInvoice(null);
    setFormData({ invoiceNumber: '', styleNumber: '', quantity: '', totalAmount: '', remarks: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const doc = {
      _type: 'invoice',
      customer: { _type: 'reference', _ref: customerId },
      invoiceNumber: formData.invoiceNumber,
      styleNumber: formData.styleNumber,
      quantity: Number(formData.quantity),
      totalAmount: Number(formData.totalAmount),
      remarks: formData.remarks,
    };
    try {
      if (editingInvoice) {
        const { isPaid, ...updateData } = doc; 
        const updatedInvoice = await client.patch(editingInvoice._id).set(updateData).commit();
        setInvoices(prev => prev.map(inv => inv._id === editingInvoice._id ? updatedInvoice : inv));
      } else {
        const newInvoice = await client.create({ ...doc, isPaid: false });
        setInvoices(prev => [newInvoice, ...prev]);
      }
      closeModal();
    } catch (error) { console.error("Failed to save invoice:", error); }
    finally { setFormLoading(false); }
  };

  const handleEditClick = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoiceNumber: invoice.invoiceNumber || '',
      styleNumber: invoice.styleNumber || '',
      quantity: invoice.quantity || '',
      totalAmount: invoice.totalAmount || '',
      remarks: invoice.remarks || '',
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    setLoading(true);
    setIsDeleteModalOpen(false);
    try {
      await client.delete(invoiceToDelete);
      setInvoices(prev => prev.filter(inv => inv._id !== invoiceToDelete));
    } catch (error) { console.error("Failed to delete invoice:", error); }
    finally { setLoading(false); setInvoiceToDelete(null); }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      const transaction = client.transaction();
      json.forEach(row => {
        if (!row.InvoiceNumber || !row.TotalAmount) {
          console.warn("Skipping row with missing data:", row);
          return;
        }
        const newDoc = {
          _type: 'invoice',
          customer: { _type: 'reference', _ref: customerId },
          invoiceNumber: row.InvoiceNumber,
          styleNumber: row.StyleNumber,
          quantity: Number(row.Quantity),
          totalAmount: Number(row.TotalAmount),
          remarks: row.Remarks,
          isPaid: false,
        };
        transaction.create(newDoc);
      });
      try {
        await transaction.commit();
        fetchData(); 
        alert('Excel data uploaded successfully!');
      } catch (error) {
        console.error('Excel upload failed:', error);
        alert('Error uploading Excel data. Check console for details.');
      } finally {
        setLoading(false);
        e.target.value = null;
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- JSX (Piṭuva) ---
  if (loading && !customer) {
    return <LoadingSpinner />;
  }

  return (
    <PageWrapper>
      {customer && (
        <CustomerHeader>
          <DefaultUserImage customer={customer} size="70px" />
          <div>
            <p style={{ margin: 0, color: '#555', fontSize: '1rem' }}>Invoices for</p>
            <CustomerName>{customer.name}</CustomerName>
          </div>
        </CustomerHeader>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <StatsCard title="Total Outstanding (OD)" value={formatCurrency(totals.od)} icon={<FaExclamationCircle />} color="#ff6b6b" $bg="#FFF0F0" />
        <StatsCard title="Total Paid" value={formatCurrency(totals.paid)} icon={<FaCheckCircle />} color="#28a745" $bg="#EAF7EC" />
      </div>

      <Toolbar>
        <FilterButtons>
          <FilterButton $active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
          <FilterButton $active={filter === 'od'} onClick={() => setFilter('od')}>Outstanding</FilterButton>
          <FilterButton $active={filter === 'paid'} onClick={() => setFilter('paid')}>Paid</FilterButton>
        </FilterButtons>
        <ActionButtons>
          <HiddenInput type="file" id="excelUpload" accept=".xlsx, .xls" onChange={handleExcelUpload} />
          <label htmlFor="excelUpload">
            <Button as="span"><FaFileExcel /> Upload Excel</Button>
          </label>
          <Button $primary onClick={() => setIsAddModalOpen(true)}>
            <FaPlus /> Add New Invoice
          </Button>
        </ActionButtons>
      </Toolbar>

      {loading ? <LoadingSpinner /> : (
        <InvoiceTable>
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Style No.</th>
              <th>Quantity (Pcs)</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.length > 0 ? currentPageData.map(inv => (
              <tr key={inv._id}>
                <td>{inv.invoiceNumber}</td>
                <td>{inv.styleNumber || 'N/A'}</td>
                <td>{inv.quantity || 'N/A'}</td>
                <td>{formatCurrency(inv.totalAmount || 0)}</td>
                <td>
                  {inv.isPaid ? (
                    <PaidStatus><FaCheckCircle /> Paid</PaidStatus>
                  ) : (
                    <span style={{ color: '#ff6b6b', fontWeight: '600' }}>OD</span>
                  )}
                </td>
                <td>
                  <TableActions>
                    <div>
                      {!inv.isPaid && (
                        <MarkPaidButton onClick={() => handleMarkAsPaidClick(inv._id)}>
                          Mark as Paid
                        </MarkPaidButton>
                      )}
                    </div>
                    <IconGroup>
                      <IconButton onClick={() => handleEditClick(inv)}>
                        <FaEdit />
                      </IconButton>
                      <IconButton $delete onClick={() => handleDeleteClick(inv._id)}>
                        <FaTrash />
                      </IconButton>
                    </IconGroup>
                  </TableActions>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  No invoices found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </InvoiceTable>
      )}
      
      {pageCount > 1 && (
        <PaginationWrapper>
          <ReactPaginate
            previousLabel={'Previous'} nextLabel={'Next'} breakLabel={'...'}
            pageCount={pageCount} marginPagesDisplayed={2} pageRangeDisplayed={5}
            onPageChange={handlePageClick} containerClassName={'pagination'}
            activeClassName={'selected'} disabledClassName={'disabled'}
          />
        </PaginationWrapper>
      )}

      {isAddModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <CloseButton onClick={closeModal}><FaTimes /></CloseButton>
            <h2>{editingInvoice ? 'Edit Invoice' : 'Add New Invoice'}</h2>
            <Form onSubmit={handleFormSubmit}>
              <div>
                <Label>Invoice Number *</Label>
                <Input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleFormChange} required />
              </div>
              <div>
                <Label>Style Number</Label>
                <Input name="styleNumber" value={formData.styleNumber} onChange={handleFormChange} />
              </div>
              <div>
                <Label>Quantity (Pcs)</Label>
                <Input name="quantity" type="number" value={formData.quantity} onChange={handleFormChange} />
              </div>
              <div>
                <Label>Total Amount (LKR) *</Label>
                <Input name="totalAmount" type="number" step="0.01" value={formData.totalAmount} onChange={handleFormChange} required />
              </div>
              <div className="full-width">
                <Label>Remarks</Label>
                <Input name="remarks" value={formData.remarks} onChange={handleFormChange} />
              </div>
              <SubmitButton $primary type="submit" disabled={formLoading}>
                {formLoading ? 'Saving...' : (editingInvoice ? 'Save Changes' : 'Save Invoice')}
              </SubmitButton>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}

      <ConfirmationModal
        show={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmMarkAsPaid}
        title="Confirm Payment"
        message="Are you sure this invoice has been paid? This action cannot be undone."
        type="confirm" 
      />
      <ConfirmationModal
        show={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This is permanent."
        type="delete"
      />

    </PageWrapper>
  );
};

// --- StatsCard Component ---
const StatsCardWrapper = styled.div`
  background-color: #ffffff; border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); padding: 1.5rem;
  display: flex; align-items: center; gap: 1.5rem; flex: 1; min-width: 280px;
`;
const StatsIconWrapper = styled.div`
  font-size: 2rem; padding: 1rem; border-radius: 50%; display: flex;
  align-items: center; justify-content: center;
  color: ${(props) => props.$color || '#007bff'};
  background-color: ${(props) => props.$bg || '#F0F8FF'};
`;
const StatsInfoWrapper = styled.div`
  h3 { margin: 0; font-size: 1rem; color: #555; font-weight: 500; text-transform: uppercase; }
  p { 
    margin: 0; 
    font-size: 1.25rem;
    color: #0A2540; 
    font-weight: 700;
    word-break: break-all;
  }
`;
const StatsCard = ({ title, value, icon, color, $bg }) => (
  <StatsCardWrapper>
    <StatsIconWrapper $color={color} $bg={$bg}>{icon}</StatsIconWrapper>
    <StatsInfoWrapper>
      <h3>{title}</h3>
      <p>{value}</p>
    </StatsInfoWrapper>
  </StatsCardWrapper>
);

export default CustomerInvoices;