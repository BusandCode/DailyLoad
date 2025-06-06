"use client"
import React, { useState, useEffect } from 'react'
import { db } from '/lib/firebase' // Adjust path based on your structure
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore'

const Page = () => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, taskId: null, taskTitle: '' })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    status: 'pending'
  })

  // Fetch tasks from Firebase with real-time updates
  useEffect(() => {
    const fetchTasks = () => {
      try {
        const tasksCollection = collection(db, 'tasks')
        const q = query(tasksCollection, orderBy('createdAt', 'desc'))
        
        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tasksData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          
          setTasks(tasksData)
          setLoading(false)
          setError(null)
        }, (err) => {
          console.error('Error fetching tasks:', err)
          setError('Failed to load tasks. Please check your connection.')
          setLoading(false)
        })

        // Cleanup subscription on unmount
        return unsubscribe
      } catch (err) {
        console.error('Error setting up tasks listener:', err)
        setError('Failed to connect to database.')
        setLoading(false)
      }
    }

    const unsubscribe = fetchTasks()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const handleCreateTask = () => {
    setNewTask(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Please enter a task title')
      return false
    }
    if (!formData.description.trim()) {
      alert('Please enter a task description')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setError(null)
      
      // Add task to Firebase
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log('Task added with ID:', docRef.id)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        status: 'pending'
      })
      setNewTask(false)
    } catch (error) {
      console.error('Error adding task:', error)
      setError('Error adding task. Please try again.')
    }
  }

  const handleCancel = () => {
    setNewTask(false)
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      status: 'pending'
    })
  }

  const handleTaskUpdate = async (taskId, field, value) => {
    try {
      setError(null)
      
      // Update in Firebase
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        [field]: value,
        updatedAt: serverTimestamp()
      })

      console.log(`Task ${taskId} updated: ${field} = ${value}`)
    } catch (error) {
      console.error('Error updating task:', error)
      setError('Error updating task. Please try again.')
    }
  }

  const handleDeleteTask = (taskId, taskTitle) => {
    setDeleteConfirm({
      show: true,
      taskId: taskId,
      taskTitle: taskTitle
    })
  }

  const confirmDelete = async () => {
    try {
      setError(null)
      
      // Delete from Firebase
      await deleteDoc(doc(db, 'tasks', deleteConfirm.taskId))
      console.log(`Task ${deleteConfirm.taskId} deleted`)
      
      // Close confirmation dialog
      setDeleteConfirm({ show: false, taskId: null, taskTitle: '' })
    } catch (error) {
      console.error('Error deleting task:', error)
      setError('Error deleting task. Please try again.')
      setDeleteConfirm({ show: false, taskId: null, taskTitle: '' })
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, taskId: null, taskTitle: '' })
  }

  if (loading) {
    return (
      <div className="bg-white w-full min-h-screen p-3 flex justify-center items-center">
        <div className="text-[#11084a] text-lg">Loading tasks...</div>
      </div>
    )
  }

  return (
    <section className='bg-white w-full min-h-screen p-3 flex flex-col'>
      <div className='lg:w-1/2 mx-auto'>
        {/* Error Message */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirm.show && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border-2 border-[#11084a]'>
              <h3 className='text-[#11084a] font-semibold text-xl mb-4'>Confirm Delete</h3>
              <p className='text-gray-700 mb-6'>
                Are you sure you want to delete the task "{deleteConfirm.taskTitle}"? 
                This action cannot be undone.
              </p>
              <div className='flex gap-3 justify-end'>
                <button 
                  onClick={cancelDelete}
                  className='bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors'
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors'
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Name of user */}
        <div className='flex items-center gap-1 mb-4'>
          <div className='bg-[#11084a] p-2 text-[16px] text-white font-bold rounded-full w-[41px] h-[41px] flex justify-center items-center'>A</div>
          <h1 className='text-[#11084a] font-semibold'>Andrew Adetokunbo</h1>
        </div>

        {/* Add Task Button */}
        <div className='mb-5'>
          <button 
            onClick={handleCreateTask} 
            className='bg-[#11084a] text-white text-[16px] w-[120px] h-[40px] p-2 rounded-md hover:bg-[#1a0f5c] transition-colors'
          >
            Create Task
          </button>
        </div>

        {/* New Task Form */}
        {newTask && (
          <div className='bg-white p-5 rounded-md shadow-md mb-5 border-2 border-[#11084a]'>
            <h2 className='text-[#11084a] font-semibold text-lg mb-4'>Create New Task</h2>
            <form onSubmit={handleSubmit}>
              <div className='flex flex-col gap-4'>
                {/* Title */}
                <div className='flex flex-col'>
                  <label className='text-[#11084a] font-medium mb-1'>Title *</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md' 
                    placeholder="Enter task title"
                    required
                  />
                </div>

                {/* Description */}
                <div className='flex flex-col'>
                  <label className='text-[#11084a] font-medium mb-1'>Description *</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className='border-[1px] border-[#2d1b69] text-[#2d1b69] w-full resize-none h-[100px] p-2 outline-0 rounded-md' 
                    placeholder="Enter task description"
                    required
                  ></textarea>
                </div>

                {/* Date and Time */}
                <div className='flex gap-4'>
                  <div className='flex flex-col flex-1'>
                    <label className='text-[#11084a] font-medium mb-1'>Date</label>
                    <input 
                      type="text" 
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md'
                      placeholder="e.g., 3rd of June"
                    />
                  </div>
                  <div className='flex flex-col flex-1'>
                    <label className='text-[#11084a] font-medium mb-1'>Time</label>
                    <input 
                      type="text" 
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md'
                      placeholder="e.g., 9am"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className='flex flex-col'>
                  <label className='text-[#11084a] font-medium mb-1'>Status</label>
                  <select 
                    name="status" 
                    value={formData.status}
                    onChange={handleInputChange}
                    className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md'
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Form Buttons */}
                <div className='flex gap-3 mt-2'>
                  <button 
                    type="submit"
                    className='bg-[#11084a] text-white px-4 py-2 rounded-md hover:bg-[#1a0f5c] transition-colors'
                  >
                    Add Task
                  </button>
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className='bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className='flex flex-col justify-center gap-[20px]'>
          {tasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No tasks yet. Create your first task!
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id}>
                <div className='flex flex-col gap-[10px] bg-gray-50 p-5 rounded-md shadow-md mb-5 border-2 border-[#11084a]'>
                  {/* Delete Button */}
                  <div className='flex justify-end mb-2'>
                    <button 
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      className='bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm'
                    >
                      Delete
                    </button>
                  </div>

                  {/* Title */}
                  <div className='flex flex-col justify-center items-start'>
                    <label className='text-[#11084a] font-medium mb-1'>Title</label>
                    <input 
                      type="text" 
                      className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md' 
                      value={task.title || ''}
                      onChange={(e) => handleTaskUpdate(task.id, 'title', e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className='flex flex-col justify-center items-start'>
                    <label className='text-[#11084a] font-medium mb-1'>Description</label>
                    <textarea 
                      className='border-[1px] border-[#2d1b69] text-[#2d1b69] w-full resize-none h-[100px] p-2 outline-0 rounded-md' 
                      value={task.description || ''}
                      onChange={(e) => handleTaskUpdate(task.id, 'description', e.target.value)}
                    ></textarea>
                  </div>

                  {/* Date and Time */}
                  <div className='flex gap-4'>
                    <div className='flex flex-col flex-1'>
                      <label className='text-[#11084a] font-medium mb-1'>Date</label>
                      <input 
                        type="text" 
                        className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md' 
                        value={task.date || ''}
                        onChange={(e) => handleTaskUpdate(task.id, 'date', e.target.value)}
                      />
                    </div>
                    <div className='flex flex-col flex-1'>
                      <label className='text-[#11084a] font-medium mb-1'>Time</label>
                      <input 
                        type="text" 
                        className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md' 
                        value={task.time || ''}
                        onChange={(e) => handleTaskUpdate(task.id, 'time', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className='flex flex-col justify-center items-start'>
                    <label className='text-[#11084a] font-medium mb-1'>Status</label>
                    <select 
                      name="status" 
                      className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md' 
                      value={task.status || 'pending'}
                      onChange={(e) => handleTaskUpdate(task.id, 'status', e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

export default Page