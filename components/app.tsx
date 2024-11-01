// pages/index.tsx
import React, { useState } from 'react';
import TopNavBar from '@/components/TopNavBar';
import ChatArea from '@/components/ChatArea';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import config from '@/config';


const Home: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex flex-1 overflow-hidden h-screen w-full">
        {config.includeLeftSidebar && <LeftSidebar />}
        <ChatArea />
        {config.includeRightSidebar && <RightSidebar />}
      </div>
    </div>
    
  );
};

export default Home;