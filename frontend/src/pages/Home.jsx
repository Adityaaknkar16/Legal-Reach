import React from 'react';
import Hero from '../components/slider';
import PracticeAreas from '../components/PracticeAreas';
import FeaturedLawyers from '../components/FeaturedLawyers';
import About from '../components/About';

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