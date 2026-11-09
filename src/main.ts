import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

const galleryContainer = document.getElementById('gallery') as HTMLElement;

class PhotoData {
  public thumbnailPath: string;
  public filePath: string;
  public height: number;
  public width: number;
  public timestamp: string | null;

  constructor(thumbnailPath: string, filePath: string, height: number, width: number, timestamp: string | null) {
    this.thumbnailPath = thumbnailPath;
    this.filePath = filePath;
    this.height = height;
    this.width = width;
    this.timestamp = timestamp;
  }
}

function getRowSpan(width: number, height: number): number {
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth < 600;
  const cols = isMobile ? 3 : Math.max(3, Math.floor((screenWidth - 32) / 200));
  const gap = isMobile ? 8 : (screenWidth >= 1024 ? 16 : 12);
  const padding = isMobile ? 16 : 32;
  
  const availableWidth = screenWidth - padding - (gap * (cols - 1));
  const colWidth = availableWidth / cols;
  
  const rowHeight = 5;
  const renderedHeight = colWidth * (height / width);
  const totalSpan = Math.ceil((renderedHeight + gap) / (rowHeight + gap));
  
  return Math.max(totalSpan, 8);
}

async function initGallery() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/MontesOwn/the-megs-wedding/refs/heads/main/photos.json');
    const data = await response.json();
    
    const photos: PhotoData[] = data.map(
      (item: any) => new PhotoData(item.thumbnailPath, item.filePath, item.height, item.width, item.timestamp)
    );

    photos.sort((a, b) => {
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;

      const normalizeDate = (ts: string) => new Date(ts.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'));

      const dateA = normalizeDate(a.timestamp);
      const dateB = normalizeDate(b.timestamp);

      return dateB.getTime() - dateA.getTime();
    });

    let htmlContent = '';
    photos.forEach(photo => {
      const rowSpan = getRowSpan(photo.width, photo.height);
      const altArr = photo.filePath.split("/")
      const alt = altArr[altArr.length - 1];

      htmlContent += `
        <a href="${photo.filePath}" 
           style="grid-row-end: span ${rowSpan};"
           data-pswp-width="${photo.width}" 
           data-pswp-height="${photo.height}" 
           target="_blank" 
           rel="noreferrer">
          <img src="${photo.thumbnailPath}" alt='${alt}' loading="lazy" />
        </a>
      `;
    });

    galleryContainer.innerHTML = htmlContent;

    const lightbox = new PhotoSwipeLightbox({
      gallery: '#gallery',
      children: 'a',
      pswpModule: () => import('photoswipe')
    });

    lightbox.on('uiRegister', () => {
      if (!lightbox.pswp || !lightbox.pswp.ui) return;

      lightbox.pswp.ui.registerElement({
        name: 'download-button',
        order: 8,
        isButton: true,
        tagName: 'a',
        html: {
          isCustomSVG: true,
          inner: '<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" id="pswp__icn-material-download"/>',
          outlineID: 'pswp__icn-material-download'
        },
        onInit: (el, pswp) => {
          el.setAttribute('download', '');
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener');

          pswp.on('change', () => {
            if (pswp.currSlide?.data.src) {
              (el as HTMLAnchorElement).href = pswp.currSlide.data.src as string;
            }
          });
        }
      });
    });

    lightbox.init();

  } catch (error) {
    console.error('Failed to load gallery images:', error);
  }
}

initGallery();