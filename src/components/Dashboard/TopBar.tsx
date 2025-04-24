import React from 'react'
import { FiCalendar } from 'react-icons/fi'

const date = new Date().toLocaleDateString('en-GB', {
  weekday: 'long',  
  year: 'numeric',  
  month: 'long',   
  day: 'numeric' 
});

const TopBar = () => {
  return (
    <div className='border-b px-4 mb-4 mt-2 pb-4 border-stone-200'>
      <div className='flex items-center justify-between p=0.5'>
      <div>
        <span className='text-sm font-bold block'>Welcome Back</span>
        <span className='text-sm block text-stone-500'>{date}</span>
      </div>

      <button className='flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded'>
        <FiCalendar/>
        <span>Prev Week</span>
      </button>
      </div>
    </div>
  )
}

export default TopBar
