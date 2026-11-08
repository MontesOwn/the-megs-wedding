import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

const main = document.querySelector("main") as HTMLElement;
const galleryContainer = document.getElementById('gallery') as HTMLElement;

class PhotoData {
  public filePath: string;
  public height: number;
  public width: number;

  constructor(filePath: string, height: number, width: number) {
    this.filePath = filePath;
    this.height = height;
    this.width = width;
  }
}

async function initGallery() {
  

  try {
    const response = await fetch('photos.json');
    const data = await response.json();
    const photos: PhotoData[] = data.map((item: PhotoData) => new PhotoData(item.filePath, item.height, item.width));

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

    lightbox.init();

  } catch (error) {
    console.error('Failed to load gallery images:', error);
  }
}

initGallery();