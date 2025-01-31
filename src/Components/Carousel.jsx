import * as React from "react";
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

export function CarouselPlugin() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  // Images array
  const images = [
    { src: "/muslim17.jpg", alt: "Image 1" },
    { src: "/muslim10.jpg", alt: "Image 1" },
    { src: "/muslim4.jpg", alt: "Image 2" },
    { src: "/muslim18.jpg", alt: "Image 3" },
    { src: "/muslim12.jpg", alt: "Image 3" },
    { src: "/muslim71.jpg", alt: "Image 3" },
  ];

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="w-[100%] h-[90%] flex justify-center items-center">
              <Image
                src={image.src}
                alt={image.alt}
                // layout="intrinsic" // Automatically adapts to the image's natural dimensions
                width={800} // Adjust as necessary
                height={100} // Adjust as necessary
                className="rounded-md shadow-lg"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* <CarouselPrevious /> */}
      {/* <CarouselNext /> */}
    </Carousel>
  );
}
