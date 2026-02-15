import React from 'react';
import Hero from '../components/slider.jsx';
import PracticeAreas from '../components/PracticeAreas.jsx';
import FeaturedLawyers from '../components/FeaturedLawyers.jsx';
import About from '../components/About.jsx';
import VoiceCall from '../components/VoiceCall.jsx'; 

const Home = () => {
  return (
    <div>
      {/* --- TEMPORARY TESTING SECTION --- */}
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
        <h2>🚧 Voice Call Testing Zone 🚧</h2>
        <p>Open this page in two different tabs/browsers to test calling.</p>
        <VoiceCall />
      </div>
      {/* ---------------------------------- */}

      <Hero />
      <PracticeAreas />
      <FeaturedLawyers />
      <About />
    </div>
  );
};

export default Home;