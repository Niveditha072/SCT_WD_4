import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TodoApp.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Sun, Moon } from 'lucide-react';

// Loader Component inside same file (for simplicity)
const Loader = () => (
  <div className="loader-container">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const TodoApp = () => {
  const [task, setTask] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true); // loading state added

  const API = 'https://sct-wd-4-todo-backend.onrender.com/tasks';

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(API);
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (task.trim() === '') return;
    const newTask = { text: task, completed: false, date: dateTime };

    try {
      const res = await axios.post(API, newTask);
      setTasks([...tasks, res.data]);
      setTask('');
      setDateTime('');
      toast.success('Task Added ✅');
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const toggleCompleted = async (id) => {
    const target = tasks.find((t) => t._id === id);
    try {
      const res = await axios.put(`${API}/${id}`, {
        ...target,
        completed: !target.completed,
      });
      setTasks(tasks.map((task) => (task._id === id ? res.data : task)));
    } catch (err) {
      console.error('Error toggling complete:', err);
    }
  };

  const saveEditedTask = async (id) => {
    const edited = tasks.find((t) => t._id === id);
    try {
      const res = await axios.put(`${API}/${id}`, {
        ...edited,
        text: edited.editText,
      });
      setTasks(
        tasks.map((task) =>
          task._id === id ? { ...res.data, isEditing: false } : task
        )
      );
      toast.success('Task Saved ✅');
    } catch (err) {
      console.error('Error saving edit:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
      toast.success('Task Deleted 🗑️');
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  return (
    <div className={`todo-container ${darkMode ? 'dark' : ''}`}>
      <div className="top-bar">
        <h2>📝 To-Do App</h2>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="input-section">
            <input
              type="text"
              placeholder="Enter a task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
            <button onClick={handleAddTask}>Add</button>
          </div>

          <div className="filter-section">
            <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active-filter' : ''}>All</button>
            <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active-filter' : ''}>Completed</button>
            <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active-filter' : ''}>Pending</button>
          </div>

          <ul className="task-list">
            {filteredTasks.map((item) => (
              <li key={item._id}>
                <input type="checkbox" checked={item.completed} onChange={() => toggleCompleted(item._id)} />
                <div style={{ flex: 1 }}>
                  {item.isEditing ? (
                    <>
                      <input
                        type="text"
                        value={item.editText}
                        onChange={(e) => {
                          const updated = tasks.map((task) =>
                            task._id === item._id ? { ...task, editText: e.target.value } : task
                          );
                          setTasks(updated);
                        }}
                      />
                      <button onClick={() => saveEditedTask(item._id)}>Save</button>
                    </>
                  ) : (
                    <>
                      <span className={item.completed ? 'task-text completed' : 'task-text'}>
                        {item.text}
                      </span>
                      {item.date && (
                        <div className="task-date">
                          📅 {new Date(item.date).toLocaleString()}
                        </div>
                      )}
                      {item.completed && <div className="completed-label">✅ Completed</div>}
                    </>
                  )}
                </div>

                {!item.isEditing && (
                  <>
                    <button onClick={() => {
                      const updated = tasks.map((task) =>
                        task._id === item._id ? { ...task, isEditing: true, editText: task.text } : task
                      );
                      setTasks(updated);
                    }}>
                      Edit
                    </button>
                    <button onClick={() => deleteTask(item._id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>

          <ToastContainer position="bottom-right" autoClose={2000} />
        </>
      )}
    </div>
  );
};

export default TodoApp;
