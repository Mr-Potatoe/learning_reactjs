'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';

import { Avatar } from '@/components/Avatar';

const ITEMS_PER_PAGE = 100;

interface ImageData {
  url: string;
  alt: string;
  type: string;
  size: number;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [filters, setFilters] = useState({ type: 'all', minSize: 0, maxSize: Infinity });
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);


  const filteredImages = images.filter(img => {
    const typeMatch = filters.type === 'all' || img.type === filters.type;
    const sizeMatch = img.size >= filters.minSize && img.size <= filters.maxSize;
    return typeMatch && sizeMatch;
  });

  const totalPages = Math.ceil(filteredImages.length / ITEMS_PER_PAGE);
  const paginatedImages = filteredImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setImages(data.images);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      alert('Failed to scrape website. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const JSZip = (await import('jszip')).default;
      const { saveAs } = await import('file-saver');
      const zip = new JSZip();
      const imgFolder = zip.folder('scraped-images');

      let successfulDownloads = 0;

      // Process images in batches
      const batchSize = 3;
      for (let i = 0; i < images.length; i += batchSize) {
        const batch = images.slice(i, i + batchSize);

        await Promise.all(batch.map(async (img, index) => {
          try {
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(img.url)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            // Get the exact binary data without any processing
            const arrayBuffer = await response.arrayBuffer();
            const extension = img.type || img.url.split('.').pop()?.split('?')[0] || 'jpg';

            // Add the raw binary data to the zip
            imgFolder?.file(`${img.alt || 'image'}-${i + index}.${extension}`, arrayBuffer);
            successfulDownloads++;
          } catch (error) {
            console.error(`Failed to download ${img.url}:`, error);
          }
        }));

        setDownloadProgress(Math.floor(((i + batchSize) / images.length) * 100));
      }

      if (successfulDownloads === 0) {
        throw new Error('No images could be downloaded');
      }

      // Generate zip WITHOUT compression
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'STORE' // No compression to preserve quality
      });

      saveAs(content, 'scraped-images.zip');
      alert(`Successfully downloaded ${successfulDownloads} images in original quality`);
    } catch (error) {
      console.error('Error creating zip file:', error);
      alert('Failed to create download. Some images may not have been downloaded.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const downloadSingle = async (imgUrl: string, alt: string) => {
    try {
      const { saveAs } = await import('file-saver');
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(imgUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the exact binary data
      const blob = await response.blob();
      const extension = imgUrl.split('.').pop()?.split('?')[0] || 'jpg';

      // Create a new blob with the exact same data
      const originalQualityBlob = new Blob([blob], { type: blob.type });
      saveAs(originalQualityBlob, `${alt || 'image'}.${extension}`);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Check console for details.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Avatar />
      <div className="flex gap-4 mb-8 flex-wrap">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          className="flex-1 min-w-[300px]"
        />
        <Button onClick={handleScrape} disabled={loading}>
          {loading ? 'Scanning...' : 'Scan Website'}
        </Button>
        {images.length > 0 && (
          <Button variant="secondary" onClick={downloadAll} disabled={isDownloading}>
            {isDownloading ? 'Downloading...' : 'Download All'}
          </Button>
        )}
      </div>

      {isDownloading && (
        <div className="mb-4">
          <Progress value={downloadProgress} className="h-2" />
          <p className="text-sm text-center mt-1">
            Downloading {downloadProgress}% ({Math.floor(images.length * (downloadProgress / 100))}/{images.length} images)
          </p>
        </div>
      )}

      <div className="flex gap-4 mb-6 flex-wrap">
        <Select onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Image Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="jpeg">JPEG</SelectItem>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="gif">GIF</SelectItem>
            <SelectItem value="webp">WEBP</SelectItem>
            <SelectItem value="svg">SVG</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min Size (KB)"
            onChange={(e) => setFilters(prev => ({ ...prev, minSize: Number(e.target.value) * 1000 }))}
            className="w-[120px]"
            min="0"
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="Max Size (KB)"
            onChange={(e) => setFilters(prev => ({
              ...prev,
              maxSize: e.target.value ? Number(e.target.value) * 1000 : Infinity
            }))}
            className="w-[120px]"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {paginatedImages.map((img, index) => (
          <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
            <img
              src={img.url}
              alt={img.alt}
              className="w-full max-h-64 object-contain mb-2 cursor-pointer"
              onClick={() => setSelectedImage(img)}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
              }}
              loading="lazy"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {img.type.toUpperCase()} • {(img.size / 1024).toFixed(1)}KB
              </span>
              <Button
                size="sm"
                onClick={() => downloadSingle(img.url, img.alt)}
                disabled={isDownloading}
              >
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  if (currentPage === 1) {
                    e.preventDefault();
                    return;
                  }
                  setCurrentPage(prev => Math.max(1, prev - 1));
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            <span className="mx-4">
              Page {currentPage} of {totalPages}
            </span>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedImage?.alt || 'Image Preview'}</DialogTitle>
          </DialogHeader>
          <div className="relative h-full flex items-center justify-center">
            {selectedImage && (
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}