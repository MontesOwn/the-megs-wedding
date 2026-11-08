import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

const galleryContainer = document.getElementById('gallery') as HTMLElement;

class PhotoData {
  public filePath: string;
  public height: number;
  public width: number;
  public timestamp: string;

  constructor(filePath: string, height: number, width: number, timestamp: string) {
    this.filePath = filePath;
    this.height = height;
    this.width = width;
    this.timestamp = timestamp;
  }
}

async function initGallery() {

  try {
    const response = await fetch('https://raw.githubusercontent.com/MontesOwn/the-megs-wedding/refs/heads/main/photos.json');
    const data = await response.json();
    const photos: PhotoData[] = data.map(
      (item: any) => new PhotoData(item.filePath, item.height, item.width, item.timestamp)
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
      htmlContent += `
        <a href="${photo.filePath}" 
           data-pswp-width="${photo.width}" 
           data-pswp-height="${photo.height}" 
           target="_blank" 
           rel="noreferrer">
          <img src="${photo.filePath}" alt="Gallery photo" loading="lazy" />
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