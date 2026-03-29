const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Categories
  getCategories: () => request('/category'),
  getCategory:   (id) => request(`/category/${id}`),
  createCategory: (data) => request('/category', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/category/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/category/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: () => request('/transaction'),
  getTransaction:  (id) => request(`/transaction/${id}`),
  createTransaction: (data) => request('/transaction', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id, data) => request(`/transaction/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id) => request(`/transaction/${id}`, { method: 'DELETE' }),
};
