import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import { syncStoreAcrossTabs } from './lib/crossTabSync'
import useStudentsStore from './features/students/shared/store'
import useAttendanceStore from './features/attendance/shared/store'
import useSchedulingStore from './features/scheduling/shared/store'
import './index.css'

syncStoreAcrossTabs('qsp-students', () => useStudentsStore.persist.rehydrate())
syncStoreAcrossTabs('qsp-attendance', () => useAttendanceStore.persist.rehydrate())
syncStoreAcrossTabs('qsp-scheduling', () => useSchedulingStore.persist.rehydrate())

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)