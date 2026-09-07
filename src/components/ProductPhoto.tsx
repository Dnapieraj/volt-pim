const frames = {
  thumb: "h-11 w-11 shrink-0 rounded-md object-cover",
  form: "h-48 w-full max-w-xs rounded-lg object-contain",
  card: "h-64 w-full rounded-lg object-contain sm:h-72",
} as const;

const placeholders = {
  thumb: "h-11 w-11 shrink-0 rounded-md",
  form: "h-48 w-full max-w-xs rounded-lg",
  card: "h-64 w-full rounded-lg sm:h-72",
} as const;

export function ProductPhoto({
  src,
  alt,
  size = "card",
}: {
  src: string;
  alt: string;
  size?: keyof typeof frames;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-line bg-paper text-xs text-muted ${placeholders[size]}`}
        aria-hidden={size === "thumb" ? true : undefined}
      >
        {size === "thumb" ? "" : "Brak zdjęcia"}
      </div>
    );
  }

  return (
    // Blob previews from the file picker are not valid next/image sources.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`border border-line bg-paper ${frames[size]}`}
    />
  );
}
