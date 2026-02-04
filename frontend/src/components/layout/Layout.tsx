import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  // ለሞባይል ሳይድባሩ መከፈትና መዘጋቱን የሚቆጣጠር State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 1. የጎን ማውጫ (Sidebar) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 2. ዋናው የይዘት ክፍል (Main Area) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* የላይኛው ክፍል (Header) */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* 3. ትክክለኛው ገጽ የሚታይበት ቦታ (Main Content) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Outlet ማለት በ App.tsx ውስጥ በዚህ Layout ስር 
              የተጠቀሱት ገጾች (Dashboard, Admin ወዘተ) የሚቀመጡበት "ባዶ ቦታ" ነው 
            */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;