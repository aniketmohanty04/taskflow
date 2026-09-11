import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { taskAPI } from './services/api';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import HabitTracker from './components/HabitTracker';
import LoginPage from './components/LoginPage';
import './App.css';

export default function App() {
  // ─── Auth State ────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('todo_token');
    const savedUser = localStorage.getItem('todo_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('todo_token');
        localStorage.removeItem('todo_user');
        setUser(null);
      }
    } else {
      localStorage.removeItem('todo_token');
      localStorage.removeItem('todo_user');
      setUser(null);
    }
    setAuthChecked(true);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    if (window.location.pathname === '/login') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
    }
    toast.success(`👋 Welcome, ${userData.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('todo_token');
    localStorage.removeItem('todo_user');
    setUser(null);
    window.history.pushState({}, '', '/login');
    setCurrentPath('/login');
    toast.info('Logged out successfully');
  };

  const [activeTab, setActiveTab] = useState('tracker');

  // ─── Task Board State ──────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeView] = useState('board');
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', sortBy: 'createdAt', order: 'desc' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 20 });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters, page: pagination.currentPage, limit: 20 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await taskAPI.getAll(params);
      setTasks(res.data.data);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (err) { toast.error(`Failed to fetch tasks: ${err.message}`); }
    finally { setLoading(false); }
  }, [filters, pagination.currentPage]);

  const fetchStats = useCallback(async () => {
    try { const res = await taskAPI.getStats(); setStats(res.data.data); }
    catch (err) { console.error(err.message); }
  }, []);

  useEffect(() => {
    if (activeTab === 'tasks') { fetchTasks(); fetchStats(); }
  }, [activeTab, fetchTasks, fetchStats]);

  const handleCreate = async (formData) => {
    try {
      await taskAPI.create(formData);
      toast.success('✅ Task created!');
      setShowForm(false);
      fetchTasks(); fetchStats();
    } catch (err) { toast.error(`❌ ${err.message}`); throw err; }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await taskAPI.update(id, formData);
      toast.success('✅ Task updated!');
      setEditingTask(null); setShowForm(false);
      fetchTasks(); fetchStats();
    } catch (err) { toast.error(`❌ ${err.message}`); throw err; }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskAPI.patch(id, { status: newStatus });
      toast.success(`Status → "${newStatus}"`);
      fetchTasks(); fetchStats();
    } catch (err) { toast.error(`❌ ${err.message}`); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(id);
      toast.success('🗑️ Task deleted!');
      fetchTasks(); fetchStats();
    } catch (err) { toast.error(`❌ ${err.message}`); }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // ─── Auth Gate & Route Check ──────────────────────────────────────────────
  if (!authChecked) return null; // wait for localStorage check
  if (!user || currentPath === '/login') return (
    <>
      <LoginPage onLogin={handleLogin} />
      <ToastContainer position="bottom-right" autoClose={2500} theme="dark" />
    </>
  );

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewTask={() => { setEditingTask(null); setShowForm(true); }}
        user={user}
        onLogout={handleLogout}
      />

      <main className="app__main">
        {/* ── Habit Tracker Tab ── */}
        {activeTab === 'tracker' && <HabitTracker />}

        {/* ── Task Board Tab ── */}
        {activeTab === 'tasks' && (
          <>
            <Dashboard stats={stats} />
            {showForm && (
              <TaskForm
                task={editingTask}
                onSubmit={editingTask
                  ? (data) => handleUpdate(editingTask._id, data)
                  : handleCreate}
                onClose={() => { setShowForm(false); setEditingTask(null); }}
              />
            )}
            <TaskList
              tasks={tasks}
              loading={loading}
              filters={filters}
              onFilterChange={handleFilterChange}
              onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onNewTask={() => { setEditingTask(null); setShowForm(true); }}
              pagination={pagination}
              onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
              activeView={activeView}
            />
          </>
        )}
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        theme="dark"
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}
