"use client";

import { useState } from "react";
import { ProductPhoto } from "@/components/ProductPhoto";

export function ProductGallery({
  images,
  alt,
}: {
  images: { id: string; path: string }[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active]?.path ?? "";

  return (
    <div>
      <ProductPhoto src={current} alt={alt} />
      {images.length > 1 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              className={`rounded-md ${
                index === active ? "ring-2 ring-copper" : ""
              }`}
              aria-label={`Zdjęcie ${index + 1}`}
              aria-pressed={index === active}
            >
              <ProductPhoto src={image.path} alt="" size="thumb" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
