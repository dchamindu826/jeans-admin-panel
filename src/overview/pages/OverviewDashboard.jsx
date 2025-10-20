// frontend/src/overview/pages/OverviewDashboard.jsx
// (FIXED: Disabled redundant Pie Chart legend to fix overflow)
// (FIXED: Added layout.padding to charts to prevent container overflow)

import React from 'react';
import styled from 'styled-components';
import { useState, useEffect, useMemo } from 'react';
import { overviewClient } from '../../client'; // Read-Only Client
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { FaUsers, FaFileInvoiceDollar, FaExclamationTriangle, FaIndustry, FaCheckCircle } from 'react-icons/fa';
import ReactPaginate from 'react-paginate'; // Pagination sandahā

// Podu components
import StatsCard from '../../admin_panel/components/StatsCard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

// --- Styled Components (Mobile-First Design) ---

const PageWrapper = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 1rem;
  background-color: #0A2540;
  color: white;
  border-radius: 10px;
  margin-bottom: 2rem;

  svg { font-size: 2.5rem; }
  h1 { 
    margin: 0; 
    font-size: 1.75rem;
    @media (max-width: 768px) {
      font-size: 1.25rem; 
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr; /* Mobile-first: 1 column */
  gap: 1.5rem;

  /* Tablet: 2 columns */
  @media (min-width: 768px) { 
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Desktop: 3 columns */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FilterWrapper = styled.div`
  background-color: #ffffff;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column; 
  align-items: flex-start;
  gap: 1rem;
  
  label { font-weight: 600; color: #333; }
  select {
    padding: 0.5rem 0.75rem;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 1rem;
    width: 100%; 
  }

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    select {
      width: auto;
      flex-grow: 1;
      max-width: 400px;
    }
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr; 
  gap: 1.5rem;
  margin-top: 2rem;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 1.5fr;
  }
`;

const ChartContainer = styled.div`
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  position: relative; 
  height: 400px; 

  @media (min-width: 768px) {
    height: 450px; 
  }

  h2 { 
    margin-top: 0; 
    font-size: 1.25rem; 
    color: #333; 
    text-align: center;
    margin-bottom: 1rem;
  }
`;

const InvoiceListContainer = styled(ChartContainer)`
  grid-column: 1 / -1; 
  margin-top: 2rem;
  height: auto; 
  min-height: auto;
`;

const InvoiceTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #f1f1f1;
  }
  th {
    background-color: #f8f9fa;
    color: #555;
    font-size: 0.9rem;
  }
  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
`;

const PaidStatus = styled.span`
  color: #28a745;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const PaginationWrapper = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  .pagination {
    display: flex; list-style: none; padding: 0;
    li { margin: 0 5px;
      a {
        padding: 8px 12px; border-radius: 5px; color: #007bff;
        cursor: pointer; transition: all 0.2s;
        &:hover { background-color: #f0f8ff; }
      }
      &.selected a { background-color: #007bff; color: white; }
      &.disabled a { color: #ccc; }
    }
  }
`;

// ------------------------------------

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const ITEMS_PER_PAGE = 10;

const OverviewDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCustomer]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const customerQuery = '*[_type == "customer"] | order(name asc)';
      const invoiceQuery = `*[_type == "invoice"]{
        _id, isPaid, totalAmount, quantity, styleNumber, invoiceNumber,
        "customerName": customer->name, "customerId": customer->_id
      } | order(_createdAt desc)`; 
      
      try {
        const [custData, invData] = await Promise.all([
          overviewClient.fetch(customerQuery),
          overviewClient.fetch(invoiceQuery)
        ]);
        setCustomers(custData);
        setInvoices(invData);
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const processedData = useMemo(() => {
    const filteredInvoices = selectedCustomer === 'all'
      ? invoices
      : invoices.filter(inv => inv.customerId === selectedCustomer);

    let revenue = 0;
    let outstanding = 0;
    const customerOutstanding = {}; 

    filteredInvoices.forEach(invoice => {
      const invoiceTotal = invoice.totalAmount || 0;
      revenue += invoiceTotal; 

      if (!invoice.isPaid) {
        outstanding += invoiceTotal;
        if (selectedCustomer === 'all') {
          const name = invoice.customerName || 'Unknown Customer';
          customerOutstanding[name] = (customerOutstanding[name] || 0) + invoiceTotal;
        }
      }
    });

    const pieData = {
      labels: ['Total Paid', 'Total Outstanding (OD)'],
      datasets: [ {
          data: [revenue - outstanding, outstanding],
          backgroundColor: ['#007bff', '#ff6b6b'], 
          borderColor: ['#FFFFFF', '#FFFFFF'],
          borderWidth: 2,
      } ],
    };

    const sortedCustomers = Object.entries(customerOutstanding)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const barData = {
      labels: sortedCustomers.map(([name]) => name),
      datasets: [ {
          label: 'Outstanding Amount (LKR)',
          data: sortedCustomers.map(([, amount]) => amount),
          backgroundColor: '#0A2540',
          borderRadius: 5,
      } ],
    };

    return {
      stats: {
        totalRevenue: revenue,
        totalPaid: revenue - outstanding, 
        totalOutstanding: outstanding,
        customerCount: selectedCustomer === 'all' ? customers.length : 1,
      },
      pieData,
      barData,
      filteredInvoices 
    };
  }, [invoices, customers, selectedCustomer]);
  
  const pageCount = Math.ceil(processedData.filteredInvoices.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = processedData.filteredInvoices.slice(offset, offset + ITEMS_PER_PAGE);
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PageWrapper>
      <Header>
        <FaIndustry />
        <h1>Jeans Factory - CEO Overview</h1>
      </Header>
      
      <FilterWrapper>
        <label htmlFor="customerFilter">Filter by Customer:</label>
        <select 
          id="customerFilter"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="all">All Customers</option>
          {customers.map(cust => (
            <option key={cust._id} value={cust._id}>
              {cust.name}
            </option>
          ))}
        </select>
      </FilterWrapper>

      <StatsGrid>
        <StatsCard
          title="Total Revenue (Filtered)"
          value={formatCurrency(processedData.stats.totalRevenue)}
          icon={<FaFileInvoiceDollar />}
          color="#007bff"
          $bg="#E6F2FF" 
        />
        <StatsCard
          title="Total Paid (Filtered)"
          value={formatCurrency(processedData.stats.totalPaid)}
          icon={<FaCheckCircle />}
          color="#28a745"
          $bg="#EAF7EC" 
        />
        <StatsCard
          title="Total Outstanding (Filtered)"
          value={formatCurrency(processedData.stats.totalOutstanding)}
          icon={<FaExclamationTriangle />}
          color="#ff6b6b"
          $bg="#FFF0F0" 
        />
      </StatsGrid>
      
      {/* --- Charts --- */}
      {selectedCustomer === 'all' && (
        <ChartGrid>
          <ChartContainer>
            <h2>Overall Payment Status</h2>
            <Pie 
              data={processedData.pieData} 
              options={{
                responsive: true,
                maintainAspectRatio: false, 
                
                /* --- *** PIE CHART PADDING FIX *** --- */
                layout: {
                  padding: 15 // Chart eka wate podi idak thiyanna
                },
                /* --- *** ME THANA WENAS KARANNA *** --- */
                elements: {
                  arc: {
                    borderWidth: 2, // Border thickness eka
                  }
                },
                // Pie chart eke size eka pahaḷa karanna (card ekata hari yanna)
                cutout: '50%', // Doughnut wage penenna. Numeric value ekakuth denna puluwan
                radius: '70%', // Chart eke radius eka. Mekin size eka control wenawa.
                /* --------------------------------------- */

                plugins: { 
                  /* --- *** PIE CHART LEGEND FIX *** --- */
                  legend: {
                    display: false // Legend eka sampūrṇayenma ivath kaḷā
                  },
                  /* ---------------------------------- */
                  tooltip: { callbacks: {
                    label: (context) => 
                      `${context.label || ''}: ${formatCurrency(context.parsed || 0)}`
                  }}
                }
              }}
            />
          </ChartContainer>
          <ChartContainer>
            <h2>Top  Outstanding Customers</h2>
            <Bar 
              data={processedData.barData} 
              options={{
                responsive: true,
                maintainAspectRatio: false, 

                /* --- *** BAR CHART PADDING FIX *** --- */
                layout: {
                  padding: {
                    bottom: 30 // Yata labels walata ida thiyanna
                  }
                },
                /* ---------------------------------- */

                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: {
                    label: (context) => formatCurrency(context.parsed.y || 0)
                  }}
                },
                scales: { 
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `LKR ${new Intl.NumberFormat().format(value / 1000)}k` 
                    }
                  },
                  x: {
                    ticks: {
                      autoSkip: false, 
                      maxRotation: 45, 
                      minRotation: 45,
                    }
                  }
                }
              }} 
            />
          </ChartContainer>
        </ChartGrid>
      )}

      {/* --- Invoice List --- */}
      {selectedCustomer !== 'all' && (
        <InvoiceListContainer>
          <h2>Invoice Details for {customers.find(c => c._id === selectedCustomer)?.name}</h2>
          <InvoiceTable>
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Style No.</th>
                <th>Quantity (Pcs)</th>
                <th>Total Amount</th>
                <th>Status</th>
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
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    No invoices found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </InvoiceTable>
          
          {pageCount > 1 && (
            <PaginationWrapper>
              <ReactPaginate
                previousLabel={'Previous'}
                nextLabel={'Next'}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={'pagination'}
                activeClassName={'selected'}
                disabledClassName={'disabled'}
              />
            </PaginationWrapper>
          )}
        </InvoiceListContainer>
      )}
      
    </PageWrapper>
  );
};

export default OverviewDashboard;