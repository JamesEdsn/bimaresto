import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />
      <main className="flex-1 ml-[250px]">
        <Outlet />
      </main>
    </div>
  );
}
