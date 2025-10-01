import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 md:mb-12">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 pb-2">
        Image Future Glimpse
      </h1>
      <p className="text-slate-400 mt-2 text-lg">
        Upload an image and see visions of its future.
      </p>
    </header>
  );
};

export default Header;