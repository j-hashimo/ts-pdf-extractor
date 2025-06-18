'use client';
import { useState } from 'react';
import { useLoginMutation, useRegisterMutation } from '../redux/api';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register] = useRegisterMutation();
  const [login] = useLoginMutation();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await login({ email, password }).unwrap();
      localStorage.setItem('token', res.token);
      router.push('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      await register({ email, password }).unwrap();
      alert('Registered successfully! You can now log in.');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Login or Register</h1>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} /><br />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /><br />
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogin}>Login</button>
    </main>
  );
}
