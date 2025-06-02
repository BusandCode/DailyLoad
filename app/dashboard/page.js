"use client"
import React, { useState } from 'react'

const Page = () => {
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: "Go to Library", 
      description: "Read SEN 302 for 2 hours and then SEN 304 for 3 hours", 
      date: "1st of June", 
      time: "9am", 
      status: "pending", 
      createdAt: new Date("2025-04-20") 
    },
  ])
  
  const [newTask, setNewTask] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    status: 'pending'
  })

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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.title && formData.description) {
      const newTaskItem = {
        id: tasks.length + 1,
        ...formData,
        createdAt: new Date()
      }
      setTasks(prev => [...prev, newTaskItem])
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        status: 'pending'
      })
      setNewTask(false)
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

  const handleTaskUpdate = (taskId, field, value) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ))
  }

  return (
    <section className='bg-white w-full min-h-screen p-3 flex flex-col'>
      <div className='lg:w-1/2 mx-auto'>
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
            <div className='flex flex-col gap-4'>
              {/* Title */}
              <div className='flex flex-col'>
                <label className='text-[#11084a] font-medium mb-1'>Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md' 
                  placeholder="Enter task title"
                />
              </div>

              {/* Description */}
              <div className='flex flex-col'>
                <label className='text-[#11084a] font-medium mb-1'>Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className='border-[1px] border-[#2d1b69] text-[#2d1b69] w-full resize-none h-[100px] p-2 outline-0 rounded-md' 
                  placeholder="Enter task description"
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
                  onClick={handleSubmit} 
                  className='bg-[#11084a] text-white px-4 py-2 rounded-md hover:bg-[#1a0f5c] transition-colors'
                >
                  Add Task
                </button>
                <button 
                  onClick={handleCancel}
                  className='bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className='flex flex-col justify-center gap-[20px]'>
          {tasks.map(task => (
            <div key={task.id}>
              <div className='flex flex-col gap-[10px] bg-gray-50 p-5 rounded-md shadow-md mb-5 border-2 border-[#11084a]'>
                {/* Edit and Delete Buttons */}
                {/* Title */}
                <div className='flex flex-col justify-center items-start'>
                  <label className='text-[#11084a] font-medium mb-1'>Title</label>
                  <input 
                    type="text" 
                    className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md' 
                    value={task.title}
                    onChange={(e) => handleTaskUpdate(task.id, 'title', e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className='flex flex-col justify-center items-start'>
                  <label className='text-[#11084a] font-medium mb-1'>Description</label>
                  <textarea 
                    className='border-[1px] border-[#2d1b69] text-[#2d1b69] w-full resize-none h-[100px] p-2 outline-0 rounded-md' 
                    value={task.description}
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
                      value={task.date}
                      onChange={(e) => handleTaskUpdate(task.id, 'date', e.target.value)}
                    />
                  </div>
                  <div className='flex flex-col flex-1'>
                    <label className='text-[#11084a] font-medium mb-1'>Time</label>
                    <input 
                      type="text" 
                      className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0 rounded-md' 
                      value={task.time}
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
                    value={task.status}
                    onChange={(e) => handleTaskUpdate(task.id, 'status', e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Page