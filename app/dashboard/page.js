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
  onSnapshot,
  where
} from 'firebase/firestore'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

const Page = () => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, taskId: null, taskTitle: '' })
  const [taskStats, setTaskStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 })
  const [editingTasks, setEditingTasks] = useState(new Set()) // Track which tasks are being edited
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    status: 'pending'
  })

  const auth = getAuth()
  const router = useRouter()

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setLoading(false)
      } else {
        // Clear user-specific data when user logs out
        setTasks([])
        setTaskStats({ total: 0, pending: 0, inProgress: 0, completed: 0 })
        setUser(null)
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [auth, router])

  // Calculate task statistics
  useEffect(() => {
    const stats = tasks.reduce((acc, task) => {
      acc.total += 1
      switch (task.status) {
        case 'pending':
          acc.pending += 1
          break
        case 'in progress':
          acc.inProgress += 1
          break
        case 'completed':
          acc.completed += 1
          break
      }
      return acc
    }, { total: 0, pending: 0, inProgress: 0, completed: 0 })
    
    setTaskStats(stats)
  }, [tasks])

  // Fetch user-specific tasks from Firebase with real-time updates
  useEffect(() => {
    if (!user?.uid) return // Don't fetch tasks if user is not authenticated

    const fetchUserTasks = () => {
      try {
        const tasksCollection = collection(db, 'tasks')
        // Enhanced query with better security - only fetch tasks for current user
        const q = query(
          tasksCollection, 
          where('userId', '==', user.uid) // Critical: Only fetch current user's tasks
          // Note: orderBy('createdAt', 'desc') temporarily removed until index is created
        )
        
        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tasksData = querySnapshot.docs.map(doc => {
            const data = doc.data()
            // Double-check user ownership for extra security
            if (data.userId !== user.uid) {
              console.warn('Task with incorrect userId detected:', doc.id)
              return null
            }
            return {
              id: doc.id,
              ...data
            }
          }).filter(task => task !== null) // Remove any null tasks
          
          setTasks(tasksData)
          setError(null)
        }, (err) => {
          console.error('Error fetching tasks:', err)
          setError('Failed to load your tasks. Please check your connection.')
        })

        return unsubscribe
      } catch (err) {
        console.error('Error setting up tasks listener:', err)
        setError('Failed to connect to database.')
      }
    }

    const unsubscribe = fetchUserTasks()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      // Clear all user-specific data
      setTasks([])
      setTaskStats({ total: 0, pending: 0, inProgress: 0, completed: 0 })
      setNewTask(false)
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        status: 'pending'
      })
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      setError('Failed to logout. Please try again.')
    }
  }

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
    
    if (!validateForm() || !user?.uid) return

    try {
      setError(null)
      
      // Add task to Firebase with enhanced user association
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...formData,
        userId: user.uid, // Critical: Associate task with current user
        userEmail: user.email, // Store user email for reference
        userName: user.displayName || user.email.split('@')[0], // Store display name or email prefix
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log('Task added with ID:', docRef.id, 'for user:', user.uid)
      
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
    // Only allow updates if task is in editing mode
    if (!editingTasks.has(taskId)) {
      return
    }

    // Find the task to verify ownership
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.userId !== user?.uid) {
      setError('You can only edit your own tasks.')
      return
    }

    try {
      setError(null)
      
      // Update in Firebase
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        [field]: value,
        updatedAt: serverTimestamp()
      })

      console.log(`Task ${taskId} updated by user ${user.uid}: ${field} = ${value}`)
    } catch (error) {
      console.error('Error updating task:', error)
      setError('Error updating task. Please try again.')
    }
  }

  const handleEditTask = (taskId) => {
    setEditingTasks(prev => new Set([...prev, taskId]))
  }

  const handleSaveTask = (taskId) => {
    setEditingTasks(prev => {
      const newSet = new Set(prev)
      newSet.delete(taskId)
      return newSet
    })
  }

  const handleCancelEdit = (taskId) => {
    setEditingTasks(prev => {
      const newSet = new Set(prev)
      newSet.delete(taskId)
      return newSet
    })
    // Optionally refresh the task data to revert any unsaved changes
    // This would require storing original values, but for now we'll rely on real-time updates
  }

  const handleDeleteTask = (taskId, taskTitle) => {
    // Find the task to verify ownership
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.userId !== user?.uid) {
      setError('You can only delete your own tasks.')
      return
    }

    setDeleteConfirm({
      show: true,
      taskId: taskId,
      taskTitle: taskTitle
    })
  }

  const confirmDelete = async () => {
    // Double-check ownership before deletion
    const task = tasks.find(t => t.id === deleteConfirm.taskId)
    if (!task || task.userId !== user?.uid) {
      setError('You can only delete your own tasks.')
      setDeleteConfirm({ show: false, taskId: null, taskTitle: '' })
      return
    }

    try {
      setError(null)
      
      // Delete from Firebase
      await deleteDoc(doc(db, 'tasks', deleteConfirm.taskId))
      console.log(`Task ${deleteConfirm.taskId} deleted by user ${user.uid}`)
      
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
        <div className="text-[#11084a] text-lg">Loading your tasks...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-white w-full min-h-screen p-3 flex justify-center items-center">
        <div className="text-[#11084a] text-lg">Redirecting to login...</div>
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

        {/* Header with user info and logout */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-1'>
            <div className='bg-[#11084a] p-2 text-[16px] text-white font-bold rounded-full w-[41px] h-[41px] flex justify-center items-center'>
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className='text-[#11084a] font-semibold'>
                {user.displayName || user.email.split('@')[0]}'s Tasks
              </h1>
              <small className='text-gray-600'>{user.email}</small>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className='bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm'
          >
            Logout
          </button>
        </div>

        {/* Task Statistics */}
        <div className='bg-gray-50 p-4 rounded-md mb-5 border-2 border-[#11084a]'>
          <h2 className='text-[#11084a] font-semibold text-lg mb-3'>Your Task Summary</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-[#11084a]'>{taskStats.total}</div>
              <div className='text-sm text-gray-600'>Total Tasks</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-yellow-600'>{taskStats.pending}</div>
              <div className='text-sm text-gray-600'>Pending</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>{taskStats.inProgress}</div>
              <div className='text-sm text-gray-600'>In Progress</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>{taskStats.completed}</div>
              <div className='text-sm text-gray-600'>Completed</div>
            </div>
          </div>
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
              <p className="text-lg mb-2">No tasks yet!</p>
              <p className="text-sm">Create your first task to get started with organizing your work.</p>
            </div>
          ) : (
            tasks.map(task => {
              const isEditing = editingTasks.has(task.id)
              return (
                <div key={task.id}>
                  <div className='flex flex-col gap-[10px] bg-gray-50 p-5 rounded-md shadow-md mb-5 border-2 border-[#11084a]'>
                    {/* Action Buttons */}
                    <div className='flex justify-between items-center mb-2'>
                      <div className='flex gap-2'>
                        {!isEditing ? (
                          <button 
                            onClick={() => handleEditTask(task.id)}
                            className='bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm'
                          >
                            Edit
                          </button>
                        ) : (
                          <div className='flex gap-2'>
                            <button 
                              onClick={() => handleSaveTask(task.id)}
                              className='bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-sm'
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => handleCancelEdit(task.id)}
                              className='bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors text-sm'
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
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
                        className={`h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        value={task.title || ''}
                        onChange={(e) => handleTaskUpdate(task.id, 'title', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                      />
                    </div>

                    {/* Description */}
                    <div className='flex flex-col justify-center items-start'>
                      <label className='text-[#11084a] font-medium mb-1'>Description</label>
                      <textarea 
                        className={`border-[1px] border-[#2d1b69] text-[#2d1b69] w-full resize-none h-[100px] p-2 outline-0 rounded-md ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        value={task.description || ''}
                        onChange={(e) => handleTaskUpdate(task.id, 'description', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                      ></textarea>
                    </div>

                    {/* Date and Time */}
                    <div className='flex gap-4'>
                      <div className='flex flex-col flex-1'>
                        <label className='text-[#11084a] font-medium mb-1'>Date</label>
                        <input 
                          type="text" 
                          className={`h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          value={task.date || ''}
                          onChange={(e) => handleTaskUpdate(task.id, 'date', e.target.value)}
                          readOnly={!isEditing}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className='flex flex-col flex-1'>
                        <label className='text-[#11084a] font-medium mb-1'>Time</label>
                        <input 
                          type="text" 
                          className={`h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          value={task.time || ''}
                          onChange={(e) => handleTaskUpdate(task.id, 'time', e.target.value)}
                          readOnly={!isEditing}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className='flex flex-col justify-center items-start'>
                      <label className='text-[#11084a] font-medium mb-1'>Status</label>
                      <select 
                        name="status" 
                        className={`h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        value={task.status || 'pending'}
                        onChange={(e) => handleTaskUpdate(task.id, 'status', e.target.value)}
                        disabled={!isEditing}
                      >
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

export default Page