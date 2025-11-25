import { lazy } from 'react'
import { createHashRouter, Navigate, RouteObject, RouterProvider } from 'react-router-dom'
import Layout from '@/options/components/Layout'
import General from '@/options/views/General'

const AITranslation = lazy(() => import('@/options/views/AITranslation'))
const DataSync = lazy(() => import('@/options/views/dataSync'))
const Local = lazy(() => import('@/options/views/dataSync/Local'))
const Notion = lazy(() => import('@/options/views/dataSync/Notion'))

// 路由配置表
const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="general" replace />,
      },
      {
        path: 'general',
        element: <General />,
      },
      {
        path: 'ai-translation',
        element: <AITranslation />,
      },
      {
        path: 'data-sync',
        element: <DataSync />,
        children: [
          {
            index: true,
            element: <Navigate to="local" replace />,
          },
          {
            path: 'local',
            element: <Local />,
          },
          {
            path: 'notion',
            element: <Notion />,
          },
        ],
      },
    ],
  },
]

export default function Router() {
  const router = createHashRouter(routes)
  return <RouterProvider router={router} />
}
