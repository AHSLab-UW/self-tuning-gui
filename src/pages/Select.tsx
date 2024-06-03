import scene1 from "../assets/imgs/outdoor.jpg";
import scene2 from "../assets/imgs/indoor.jpg";
import ImageCarousel from "../components/ImageCarousel";
import "../styles/Select.css";

export default function Select(this: any) {
  return (
    <>
      <h3 className= "selection" style={{ marginTop: 90, marginLeft: -30, marginRight: -30 }}>
        Swipe and select the scene for which you want to fit your hearing aid </h3>
      <div style={{ position: "relative" }}>
      
        <ImageCarousel
          images={[
            { src: scene1, alt: "Scene 1" },
            { src: scene2, alt: "Scene 2" }
          ]}
        />
      </div>
    </>
  );
}
