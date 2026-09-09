import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { taskAPI } from './services/api';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeView, setActiveView] = useState('board'); // 'board' | 'list'
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    sortBy: 'createdAt',
    order: 'desc'
  });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });

  // ─── Fetch Tasks ──────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters, page: pagination.currentPage, limit: 20 };
      // Remove empty params
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await taskAPI.getAll(params);
      setTasks(res.data.data);
      setPagination(prev => ({ ...prev, ...res.data.pagination }));
    } catch (err) {
      toast.error(`Failed to fetch tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await taskAPI.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Stats fetch error:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  // ─── CRUD Handlers ────────────────────────────────────────────────────────
  const handleCreate = async (formData) => {
    try {
      const res = await taskAPI.create(formData);
      toast.success('✅ Task created successfully!');
      setShowForm(false);
      fetchTasks();
      fetchStats();
      return res.data.data;
    } catch (err) {
      toast.error(`❌ ${err.message}`);
      throw err;
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      const res = await taskAPI.update(id, formData);
      toast.success('✅ Task updated successfully!');
      setEditingTask(null);
      setShowForm(false);
      fetchTasks();
      fetchStats();
      return res.data.data;
    } catch (err) {
      toast.error(`❌ ${err.message}`);
      throw err;
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await taskAPI.patch(id, { status: newStatus });
      toast.success(`Status updated to "${newStatus}"`);
      fetchTasks();
      fetchStats();
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskAPI.delete(id);
      toast.success('🗑️ Task deleted successfully!');
      fetchTasks();
      fetchStats();
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="app">
      <Navbar
        onNewTask={() => { setEditingTask(null); setShowForm(true); }}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main className="app__main">
        {/* Dashboard Stats */}
        <Dashboard stats={stats} />

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            task={editingTask}
            onSubmit={editingTask
              ? (data) => handleUpdate(editingTask._id, data)
              : handleCreate}
            onClose={handleFormClose}
          />
        )}

        {/* Task List */}
        <TaskList
          tasks={tasks}
          loading={loading}
          filters={filters}
          onFilterChange={handleFilterChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onNewTask={() => { setEditingTask(null); setShowForm(true); }}
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
          activeView={activeView}
        />
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
