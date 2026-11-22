import HomeHero from "@/components/HomeHero";
import AboutReveal from "@/components/AboutReveal";
import Timeline from "@/components/Timeline";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Milestones from "@/components/Milestones";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";

// One continuous page:
// name screen → (name wall splits) → About me → (story line becomes the timeline) → Experience → Projects wheel → (three columns rise) → Skills → Milestones → Certifications.
export default function Home() {
  return (
    <>
      <AboutReveal intro={<HomeHero />} />
      <Experience intro={<Timeline />} />
      <Projects outro={<Skills embedded />} />
      <Milestones outro={<Certifications embedded />} finale={<Contact embedded />} />
    </>
  );
}
