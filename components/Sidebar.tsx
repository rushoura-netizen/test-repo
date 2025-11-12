import React from 'react';

interface SidebarProps {
  quest: string;
  inventory: string[];
}

const QuestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 13v- உண்மையில்-6m6 10V7m0 10a3 3 0 110-6 3 3 0 010 6z" />
    </svg>
);

const InventoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ quest, inventory }) => {
  return (
    <aside className="w-full lg:w-1/3 xl:w-1/4 p-6 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700/50 sticky top-6 h-max">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400 flex items-center">
            <QuestIcon />
            현재 퀘스트
        </h2>
        <p className="text-gray-300 italic">{quest || "모험이 이제 막 시작됩니다..."}</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4 text-amber-500 flex items-center">
            <InventoryIcon />
            인벤토리
        </h2>
        {inventory.length > 0 ? (
          <ul className="space-y-2">
            {inventory.map((item, index) => (
              <li key={index} className="bg-gray-800/70 p-3 rounded-md text-gray-300 capitalize shadow-sm">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">주머니가 비어있습니다.</p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;