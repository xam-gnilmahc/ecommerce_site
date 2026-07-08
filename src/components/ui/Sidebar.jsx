import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BsHouseDoorFill, BsBagCheck } from 'react-icons/bs';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import logo from '../cart/assets/logo.png';
import { useAuth } from '../../context/authContext';

const links = [
  { to: '/order', label: 'Orders', icon: <BsBagCheck /> },
  { to: '/return-cancel', label: 'Cancelled', icon: <MdCancel /> },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="fixed top-4 left-4 z-[1200] md:hidden" onClick={() => setOpen(true)}>
        <FaBars />
      </button>

      {open && <div className="fixed inset-0 bg-black/35 z-[999]" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-[240px] bg-white border-r border-gray-200 p-4 flex flex-col z-[1000] transition-transform duration-250 ease-in-out -translate-x-full md:translate-x-0 ${open ? 'translate-x-0' : ''}`}
      >
        <div className="flex justify-between items-center mb-6">
          <img src={logo} className="w-[90px]" />

          <Link
            to="/"
            className="w-9 h-9 grid place-items-center rounded-md bg-gray-100 transition-colors duration-200 hover:bg-gray-200"
          >
            <BsHouseDoorFill />
          </Link>

          <button
            className="w-9 h-9 grid place-items-center rounded-md bg-gray-100 transition-colors duration-200 hover:bg-gray-200"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex gap-2 py-2 px-4 rounded-md text-gray-600 no-underline font-medium text-sm transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 ${isActive ? 'bg-gray-900 text-white' : ''}`
              }
              onClick={() => setOpen(false)}
            >
              {l.icon}
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          className="mt-auto p-2 border-none bg-red-50 text-red-600 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-red-100"
          onClick={logout}
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
