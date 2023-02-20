import ImageSlider from "../components/ImageSlider";

import shen from "../assets/imgs/shen.jpeg";
import ear from "../assets/imgs/ear-03.png";
import { NextButton } from "../components/NextButton";

export default function Select() {
  return (
    <>
      <h3>Scroll through the scenes and select the option that best fits</h3>
      <ImageSlider
        images={[
          { src: shen, alt: "shen" },
          { src: ear, alt: "ear" },
        ]}
      />

      <NextButton to="/fit" text="Next" />
    </>
  );
}
