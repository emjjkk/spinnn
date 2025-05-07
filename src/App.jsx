import { useState, useEffect } from 'react';
import { LuSettings, LuClock, LuX, LuPlus, LuRotateCw } from "react-icons/lu";
import { FaLocationDot } from "react-icons/fa6";

export default function App() {
  const [items, setItems] = useState([
    { name: 'Item 1', color: '#FF6384' },
    { name: 'Item 2', color: '#36A2EB' },
    { name: 'Item 3', color: '#FFCE56' }
  ]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', color: '#4BC0C0' });
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [history, setHistory] = useState([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('spinnnHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('spinnnHistory', JSON.stringify(history));
  }, [history]);

  const addItem = () => {
    if (newItem.name.trim() && items.length < 12) {
      setItems([...items, { ...newItem, name: newItem.name.trim() }]);
      setNewItem({ name: '', color: `#${Math.floor(Math.random()*16777215).toString(16)}` });
    }
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItemColor = (index, color) => {
    const newItems = [...items];
    newItems[index].color = color;
    setItems(newItems);
  };

  const spinWheel = () => {
    if (items.length < 2) {
      alert('Add at least 2 items to spin the wheel');
      return;
    }

    setSpinning(true);
    setWinner(null);
    
    const segments = items.length;
    const fullRotations = 5 + Math.floor(Math.random() * 6);
    const winningSegment = Math.floor(Math.random() * segments);
    const degreesPerSegment = 360 / segments;
    
    const newRotation = fullRotations * 360 + (winningSegment * degreesPerSegment);
    setRotation(prev => prev + newRotation);
    
    setTimeout(() => {
      setSpinning(false);
      const winningIndex = segments - 1 - Math.floor((rotation + newRotation) % 360 / degreesPerSegment);
      setWinner(items[winningIndex].name);
      
      const newHistory = [
        { 
          item: items[winningIndex].name, 
          date: new Date().toLocaleString() 
        }, 
        ...history
      ];
      setHistory(newHistory.slice(0, 50));
    }, 5000);
  };

  const resetWheel = () => {
    setRotation(0);
    setWinner(null);
  };

  // Generate conic gradient stops for the wheel
  const getConicGradient = () => {
    let gradientStops = [];
    const segmentPercentage = 100 / items.length;
    
    items.forEach((item, i) => {
      const start = i * segmentPercentage;
      const end = (i + 1) * segmentPercentage;
      gradientStops.push(`${item.color} ${start}% ${end}%`);
    });
    
    return gradientStops.join(', ');
  };

  return (
    <>
      <main className="w-screen h-screen relative flex items-center justify-center cal-sans-regular bg-gray-50 overflow-hidden">
        {/* Menu items */}
        <div className="absolute top-3 right-5 flex items-center">
          <h1 className="text-lg">spinnn.</h1>
        </div>
        <div className="absolute top-4 left-5 flex items-center">
          <button 
            className="p-1 text-xl hover:bg-gray-200 rounded-full transition"
            onClick={() => { setShowSettings(true); setShowHistory(false); }}
          >
            <LuSettings/>
          </button>
          <button 
            className="p-1 text-xl hover:bg-gray-200 rounded-full transition"
            onClick={() => { setShowHistory(true); setShowSettings(false); }}
          >
            <LuClock/>
          </button>
        </div>

        {/* Main content */}
        <div className="flex items-center gap-16">
          {/* Spinny wheel */}
          <div className="relative h-[500px] w-[500px]">
            <div 
              className="h-full w-full rounded-full bg-white shadow-lg transition-transform duration-5000 ease-out relative overflow-hidden"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(${getConicGradient()})`
              }}
            >
              {/* Dividing lines */}
              {items.map((_, i) => {
                const angle = (i * (360 / items.length)) * (Math.PI / 180);
                const x1 = 250 + 250 * Math.sin(angle);
                const y1 = 250 - 250 * Math.cos(angle);
                return (
                  <div 
                    key={`line-${i}`}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      transformOrigin: 'center',
                      transform: `rotate(${i * (360 / items.length)}deg)`
                    }}
                  >
                    <div 
                      className="absolute bg-white w-px h-[250px]"
                      style={{
                        left: '50%',
                        top: '0%',
                        transform: 'translateX(-50%)'
                      }}
                    ></div>
                  </div>
                );
              })}
              
              {/* Wheel labels */}
              {items.map((item, i) => {
                const angle = (i * (360 / items.length) + (360 / items.length / 2)) * (Math.PI / 180);
                const radius = 200;
                const x = 250 + radius * Math.sin(angle) - 20;
                const y = 250 - radius * Math.cos(angle) - 10;
                return (
                  <div 
                    key={i}
                    className="absolute text-sm font-medium text-center"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      width: '40px',
                      transform: `rotate(${i * (360 / items.length) + 90}deg)`,
                      transformOrigin: 'center',
                      color: getContrastColor(item.color) // Ensure text is readable
                    }}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>
            
            {/* Center button */}
            <button
              onClick={spinning ? resetWheel : spinWheel}
              disabled={spinning}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition"
            >
              {spinning ? (
                <LuRotateCw className="animate-spin text-xl" />
              ) : (
                <span className="text-sm font-medium">SPIN</span>
              )}
            </button>
            
            {/* Center pointer */}
            <div className="absolute -top-5 left-[49%] transform -translate-x-1/2 w-6 h-8">
              <FaLocationDot className="text-4xl"/>
            </div>
          </div>
          
          {/* Winner display */}
          {winner && (
            <div className="absolute right-5 bottom-5 p-5 bg-white w-[300px]">
              <h2 className="text-lg font-medium mb-2 text-center">Winner!</h2>
              <p className="text-2xl font-bold text-center py-4">{winner}</p>
              <p className="text-sm text-gray-500 text-center">spun at {new Date().toLocaleTimeString()}</p>
            </div>
          )}
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Wheel Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 rounded">
                  <LuX className="text-xl" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Add new item"
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                  />
                  <input
                    type="color"
                    value={newItem.color}
                    onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                    className="w-10 h-10"
                  />
                  <button
                    onClick={addItem}
                    disabled={!newItem.name.trim() || items.length >= 12}
                    className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
                  >
                    <LuPlus />
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[i].name = e.target.value;
                          setItems(newItems);
                        }}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                      />
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => updateItemColor(i, e.target.value)}
                        className="w-8 h-8"
                      />
                      <button
                        onClick={() => removeItem(i)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <LuX />
                      </button>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  {items.length} of 12 items added
                </p>
              </div>
              
              <button
                onClick={() => setShowSettings(false)}
                className="w-full bg-black text-white py-2 rounded"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Spin History</h2>
                <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-100 rounded">
                  <LuX className="text-xl" />
                </button>
              </div>
              
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No spin history yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.map((entry, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border-b border-gray-100">
                      <span className="font-medium">{entry.item}</span>
                      <span className="text-sm text-gray-500">{entry.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// Helper function to ensure text is readable on colored backgrounds
function getContrastColor(hexColor) {
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white depending on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
}