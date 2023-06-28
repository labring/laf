import Ability from "./ability";
import Choice from "./choice";
import Contact from "./contact";
import Footer from "./footer";
import Hero from "./hero";
import JoinUs from "./joinus";
import Navbar from "./navbar";

import "./homepage.css";

import useInviteCode from "@/hooks/useInviteCode";

export default function Home() {
  useInviteCode();

  return (
    <div style={{ fontSize: "16px" }} className="homepage">
      <Navbar />
      <div className="flex items-center justify-center">
        <div className="flex flex-col lg:mx-[48px] lg:max-w-[1200px]">
          <Hero />
          <Ability />
          <Choice />
          <JoinUs />
          <Contact />
        </div>
      </div>
      <Footer />
    </div>
  );
}
