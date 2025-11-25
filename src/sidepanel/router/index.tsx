import { lazy } from 'react'
import { createHashRouter, RouteObject, RouterProvider } from 'react-router-dom'
import Layout from '@/sidepanel/components/Layout'
import Home from '@/sidepanel/views/Home'

// 懒加载组件
const DetailWord = lazy(() => import('@/sidepanel/views/DetailWord'))

// 路由配置表
const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'detail-word/:id',
        element: <DetailWord />,
      }
    ],
  },
]

export default function Router() {
  const router = createHashRouter(routes)
  return <RouterProvider router={router} />
}
