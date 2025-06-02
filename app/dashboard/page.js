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
      createdAt:new Date ("20/04/20225")
    },
    {
      id:2,
      title:"Go to Fellowship",
      description:"Never miss church services again",
      date:"2nd of June",
      time:"7am",
      status:"In Progress",
      createdAt:new Date ("21/04/20225")
    },
    {
      id:3,
      title:"To go and sleep",
      description:"Sleep for 5 hours so as to wake up early",
      date:"3rd of June",
      time:"11pm",
      status:"Completed",
      createdAt:new Date ("22/04/20225")
    },
]
  return (
    <section className='h-full p-3 lg:w-3/5 lg:mx-auto'>
      
    </section>
  )
}

export default page
