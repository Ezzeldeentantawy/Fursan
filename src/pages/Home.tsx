import React from 'react'
import HeroSection from '../components/HeroSection'
import HowWeMake from '../components/HowWeMake'
import JobPreviewSection from '../components/JobPreviewSection'
import RecruitmentSection from '../components/RecruitmentSection'
import TestimonialSection from '../components/TestimonialSection'
import FAQSection from '../components/FAQSection'
import CTASection from '../components/CTASection'

const Home = () => {
  return (
    <>
        <main>
            <HeroSection />
            <HowWeMake />
            <JobPreviewSection />
            <RecruitmentSection />
            <TestimonialSection />
            <FAQSection />
            <CTASection />
        </main>
    </>
  )
}

export default Home;