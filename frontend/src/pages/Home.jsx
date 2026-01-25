import React from 'react';
import Hero from '../components/slider.jsx';
import PracticeAreas from '../components/PracticeAreas.jsx';
import FeaturedLawyers from '../components/FeaturedLawyers.jsx';
import About from '../components/About.jsx';

const Home = () => {
  return (
    <div>
      <Hero />
      <PracticeAreas />
      <FeaturedLawyers />
      <About />
    </div>
  );
};

export default Home;