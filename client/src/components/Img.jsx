const WIDTHS = [320, 480, 640, 800, 1200, 1600, 2000];

/** srcset for an uploaded photo whose address has "{w}" where the width goes. */
export function srcSetOf(image, max = 2000) {
  if (!image || typeof image !== 'object' || !image.url?.includes('{w}')) return undefined;
  const limit = Math.min(max, image.w || max);
  const list = WIDTHS.filter((w) => w <= limit);
  if (!list.length || list[list.length - 1] < limit) list.push(limit);
  return list.map((w) => `${image.url.replace('{w}', String(w))} ${w}w`).join(', ');
}

/** Address of a photo about `width` pixels wide (built-in photos are returned as they are). */
export const srcOf = (image, width = 800) =>
  !image ? '' : typeof image === 'string' ? image : image.url.replace('{w}', String(Math.min(width, image.w || width)));

/**
 * A photo from the admin panel: the right size for each screen, its focus point
 * kept in view when the frame crops it, and its main colour while it loads.
 */
export function Img({ image, sizes = '100vw', alt, className, eager = false, width = 1200, style }) {
  if (!image) return null;
  if (typeof image === 'string') return <img src={image} alt={alt ?? ''} className={className} loading={eager ? undefined : 'lazy'} decoding="async" style={style} />;
  return (
    <img
      src={srcOf(image, width)}
      srcSet={srcSetOf(image)}
      sizes={sizes}
      width={image.w}
      height={image.h}
      alt={alt ?? image.alt ?? ''}
      className={className}
      loading={eager ? undefined : 'lazy'}
      decoding="async"
      style={{ objectPosition: image.pos, backgroundColor: image.color, ...style }}
    />
  );
}
