// frontend/src/admin_panel/pages/AdminDashboard.jsx
// (Import Error Eka Niværadi Kara Æta)

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom'; // <-- *** NIVÆRADI KARA ÆTA ***
import { client } from '../../client'; 
import StatsCard from '../components/StatsCard';
import { 
  FaUsers, 
  FaFileInvoiceDollar, 
  FaExclamationTriangle 
} from 'react-icons/fa';

import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- Styled Components (Venas Næ) ---
const DashboardWrapper = styled.div` width: 100%; `;
const PageTitle = styled.h1`
  font-size: 2rem; color: #0A2540; margin-bottom: 2rem;
`;
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;
const ChartGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1.5fr;
  gap: 1.5rem; margin-top: 2.5rem;
  @media (max-width: 992px) { grid-template-columns: 1fr; }
`;
const ChartContainer = styled.div`
  background-color: #ffffff; padding: 1.5rem; border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  h2 { margin-top: 0; font-size: 1.25rem; color: #333; }
`;

// --- Dashboard Component Eka ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOutstanding: 0,
    customerCount: 0,
  });
  const [pieData, setPieData] = useState(null);
  const [barData, setBarData] = useState(null);

  const location = useLocation(); 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const customerQuery = '*[_type == "customer"]';
        const invoiceQuery = `*[_type == "invoice"]{
          isPaid,
          totalAmount,
          "customerName": customer->name 
        }`;
        
        const customers = await client.fetch(customerQuery);
        const invoices = await client.fetch(invoiceQuery);

        let revenue = 0;
        let outstanding = 0;
        const customerOutstanding = {};

        invoices.forEach(invoice => {
          const invoiceTotal = invoice.totalAmount || 0;
          revenue += invoiceTotal;

          if (!invoice.isPaid) {
            outstanding += invoiceTotal;
            const name = invoice.customerName || 'Unknown Customer';
            customerOutstanding[name] = (customerOutstanding[name] || 0) + invoiceTotal;
          }
        });

        setStats({
          totalRevenue: revenue,
          totalOutstanding: outstanding,
          customerCount: customers.length,
        });

        setPieData({
          labels: ['Total Paid', 'Total Outstanding (OD)'],
          datasets: [
            {
              data: [revenue - outstanding, outstanding],
              backgroundColor: ['#007bff', '#ff6b6b'],
              borderColor: ['#FFFFFF', '#FFFFFF'],
              borderWidth: 2,
            },
          ],
        });

        const sortedCustomers = Object.entries(customerOutstanding)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5); 

        setBarData({
          labels: sortedCustomers.map(([name]) => name),
          datasets: [
            {
              label: 'Outstanding Amount (LKR)',
              data: sortedCustomers.map(([, amount]) => amount),
              backgroundColor: '#0A2540',
              borderRadius: 5,
            },
          ],
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.pathname]); // Auto-refresh sandahā

  if (loading || !pieData || !barData) {
    return <div>Loading Dashboard Data...</div>;
  }

  return (
    <DashboardWrapper>
      <PageTitle>Dashboard Overview</PageTitle>

      <StatsGrid>
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<FaFileInvoiceDollar />}
          color="#007bff"
          $bg="#E6F2FF" 
        />
        <StatsCard
          title="Total Outstanding (OD)"
          value={formatCurrency(stats.totalOutstanding)}
          icon={<FaExclamationTriangle />}
          color="#ff6b6b"
          $bg="#FFF0F0" 
        />
        <StatsCard
          title="Total Customers"
          value={stats.customerCount}
          icon={<FaUsers />}
          color="#28a745"
          $bg="#EAF7EC" 
        />
      </StatsGrid>

      <ChartGrid>
        <ChartContainer>
          <h2>Payment Status</h2>
          <Pie 
            data={pieData} 
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.parsed || 0;
                      return `${label}: ${formatCurrency(value)}`;
                    }
                  }
                }
              }
            }}
          />
        </ChartContainer>
        
        <ChartContainer>
          <h2>Top 5 Outstanding Customers</h2>
          <Bar 
            data={barData} 
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const value = context.parsed.y || 0;
                      return formatCurrency(value);
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `LKR ${new Intl.NumberFormat().format(value / 1000)}k` 
                  }
                }
              }
            }} 
          />
        </ChartContainer>
      </ChartGrid>

    </DashboardWrapper>
  );
};

export default AdminDashboard;