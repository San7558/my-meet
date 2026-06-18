// src/pages/LandingPage.jsx
import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Workflow from "../components/landing/Workflow";
import TechStack from "../components/landing/TechStack";
import CTA from "../components/landing/CTA";

const LandingPage = () => {
  return (
    <div className="dark min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <TechStack />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
