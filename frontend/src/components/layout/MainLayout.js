import React from 'react';
import { Navbar } from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children, navigateTo }) => (<div className="min-h-screen flex flex-col bg-gray-50"><Navbar navigateTo={navigateTo} /><main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">{children}</main><Footer /></div>);
export default MainLayout;