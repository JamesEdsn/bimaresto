import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 ml-[250px] min-h-screen min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
