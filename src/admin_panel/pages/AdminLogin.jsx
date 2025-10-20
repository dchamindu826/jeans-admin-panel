// frontend/src/admin_panel/pages/AdminLogin.jsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { client } from '../../client'; // Sanity client
import { FaIndustry } from 'react-icons/fa';

// Sampurna piṭuva center karanna
const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #F0F8FF; // Lā Nil background
`;

const LoginForm = styled.form`
  background-color: #FFFFFF; // Sudu background
  padding: 3rem 2.5rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #0A2540; // Tada Nil
  margin-bottom: 1.5rem;

  svg {
    font-size: 2.5rem;
  }

  h1 {
    margin: 0;
    font-size: 2rem;
  }
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 5px;
  background-color: #007bff; // Pradhāna Nil paṭa
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3; // Lā Nil
  }

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4757; // Ratu paṭa
  font-size: 0.9rem;
  margin-top: 1rem;
`;

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Username and Password are required.');
      setLoading(false);
      return;
    }

    try {
      // Sanity eke 'adminUser' schema eka query karanna
      const query = `*[_type == "adminUser" && username == $username][0]`;
      const params = { username };
      
      const adminUser = await client.fetch(query, params);

      if (adminUser) {
        // User kenek innava, password eka check karanna
        if (adminUser.password === password) {
          // Password eka hari!
          // Admin details local storage eke save karanna
          localStorage.setItem('jeansFactoryAdmin', JSON.stringify({
            _id: adminUser._id,
            username: adminUser.username
          }));
          // Dashboard ekaṭa yomu karanna
          navigate('/admin/dashboard');
        } else {
          // Password varadiyi
          setError('Invalid username or password.');
        }
      } else {
        // User kenek næ
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <LogoWrapper>
          <FaIndustry />
          <h1>Jeans Factory</h1>
        </LogoWrapper>
        
        <InputField
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <InputField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <LoginButton type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </LoginButton>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </LoginForm>
    </LoginContainer>
  );
};

export default AdminLogin;