import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import PopularProducts from "@/components/home/PopularProducts";
import Deals from "@/components/home/Deals";
import HowItWorks from "@/components/home/HowItWorks";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Categories />
        <PopularProducts />
        <Deals />
        <HowItWorks />
      </main>

      <Footer />
    </>
  );
}