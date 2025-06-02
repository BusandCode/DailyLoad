import React from 'react'

const page = () => {
  const tasks = [
    {
      id:1,
      title:"Go to Library",
      description:"Read SEN 302 for 2 hours and then SEN 304 for 3 hours",
      date:"1st of June",
      time:"9am",
      status:"pending",
      createdAt:new Date ("20/04/2025")
    },
    {
      id:2,
      title:"Go to Fellowship",
      description:"Never miss church services again",
      date:"2nd of June",
      time:"7am",
      status:"in progress",
      createdAt:new Date ("21/04/2025")
    },
    {
      id:3,
      title:"To go and sleep",
      description:"Sleep for 5 hours so as to wake up early",
      date:"3rd of June",
      time:"11pm",
      status:"completed",
      createdAt:new Date ("22/04/2025")
    },
]
  return (
    <section className='bg-white w-full min-h-screen p-3 flex flex-col'>
      <div className='lg:w-1/2 mx-auto'>
      {/* Name of user */}
      <div className='flex items-center gap-1'>
        <div className='bg-[#11084a] p-2 text-[16px] text-white font-bold rounded-full w-[41px] h-[41px] flex justify-center items-center'>A</div>
        <h1 className='text-[#11084a]'>Andrew Adetokunbo</h1>
      </div>

      <div className='flex flex-col justify-center gap-[20px] mt-5'>
        {tasks.map(task=>(
          <div key={task.id} >
            <div className='flex flex-col gap-[10px] shadow-[#2d1b69] shadow-md rounded-md p-5'>
              {/* Title */}
              <div className='flex flex-col justify-center items-start'>
              <label>Title</label>
              <input type="text" className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0' placeholder={task.title}/>
              </div>
              {/* description */}
              <div className='flex flex-col justify-center items-start'>
                <label>Description</label>
                <textarea name="" id="" className='border-[1px] border-[#2d1b69] text-[#2d1b69] w-full resize-none h-[100px] p-2 outline-0' placeholder={task.description}></textarea>
              </div>
              {/* Status */}
              <div className='flex flex-col justify-center items-start'>
                <label>Status</label>
                <select name="status" className='h-[42px] text-[#2d1b69] border-[1px] border-[#2d1b69] w-full p-2 outline-0' defaultValue={task.status}>
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

export default page