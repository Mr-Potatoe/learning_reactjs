import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ImageData {
  url: string;
  alt: string;
  type: string;
  size: number;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*;q=1.0',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const images: ImageData[] = [];
    const imageElements = $('img').toArray();

    const batchSize = 5;
    for (let i = 0; i < imageElements.length; i += batchSize) {
      const batch = imageElements.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (element) => {
          const $element = $(element);
          let src = $element.attr('src');
          const srcset = $element.attr('srcset');
          const dataSrc = $element.attr('data-src');

          if (!src && !srcset && !dataSrc) return;

          // Prioritize srcset, data-src, then src
          if (srcset) {
            const srcsetOptions = parseSrcset(srcset);
            if (srcsetOptions.length > 0) {
              src = srcsetOptions.sort((a, b) => (b.width || 0) - (a.width || 0))[0].url;
            }
          } else if (dataSrc) {
            src = dataSrc;
          }

          if (!src) return;

          const absoluteUrl = new URL(src, url).href;

          // Search for the original/highest-quality version
          const bestImage = await findOriginalImage(absoluteUrl, $element.attr('alt') || 'image');
          if (!bestImage) return;

          images.push(bestImage);
        })
      );
    }

    const validImages = images.filter((img) => img.url && img.size > 0);
    return NextResponse.json({ images: validImages }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
      },
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to fetch website' }, { status: 500 });
  }
}

function parseSrcset(srcset: string): { url: string; width?: number }[] {
  try {
    const options = srcset.split(',').map((entry) => entry.trim());
    return options.map((option) => {
      const [url, descriptor] = option.split(/\s+/);
      const widthMatch = descriptor?.match(/(\d+)w/);
      const width = widthMatch ? parseInt(widthMatch[1], 10) : undefined;
      return { url, width };
    }).filter((option) => option.url);
  } catch (error) {
    console.error('Error parsing srcset:', error);
    return [];
  }
}

// New function to find the original or highest-quality image
async function findOriginalImage(imageUrl: string, altText: string): Promise<ImageData | null> {
  try {
    // Step 1: Check the provided URL first
    const candidates: ImageData[] = [];
    const initialResponse = await axios.head(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*;q=1.0',
      },
      validateStatus: () => true,
      timeout: 5000,
    });

    if (initialResponse.status === 200 && initialResponse.headers['content-type']?.startsWith('image/')) {
      const contentType = initialResponse.headers['content-type'] || 'image/unknown';
      const contentLength = parseInt(initialResponse.headers['content-length'] || '0');
      candidates.push({
        url: imageUrl,
        alt: altText,
        type: contentType.split('/')[1] || 'unknown',
        size: contentLength,
      });
    }

    // Step 2: Try to deduce the original URL by removing common compression/resize parameters
    // const urlObj = new URL(imageUrl);
    // const params = urlObj.searchParams;
    const possibleOriginalUrl = stripCompressionParams(imageUrl);
    if (possibleOriginalUrl !== imageUrl) {
      const originalResponse = await axios.head(possibleOriginalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/*;q=1.0',
        },
        validateStatus: () => true,
        timeout: 5000,
      });

      if (originalResponse.status === 200 && originalResponse.headers['content-type']?.startsWith('image/')) {
        const contentType = originalResponse.headers['content-type'] || 'image/unknown';
        const contentLength = parseInt(originalResponse.headers['content-length'] || '0');
        candidates.push({
          url: possibleOriginalUrl,
          alt: altText,
          type: contentType.split('/')[1] || 'unknown',
          size: contentLength,
        });
      }
    }

    // Step 3: Search the web/X for a higher-quality version (simulated here with a placeholder logic)
    const searchQuery = `${altText} filetype:jpg | filetype:png | filetype:webp -inurl:(thumbnail | preview)`;
    const searchResults = await simulatedWebSearch(searchQuery, imageUrl); // Replace with actual search if API available
    candidates.push(...searchResults);

    // Step 4: Pick the candidate with the largest size (assuming larger = higher quality)
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => b.size - a.size)[0];

  } catch (error) {
    console.error(`Error finding original image for ${imageUrl}:`, error);
    return null;
  }
}

// Helper to strip common compression/resize parameters from URLs
function stripCompressionParams(url: string): string {
  try {
    const urlObj = new URL(url);
    const paramsToRemove = ['w', 'h', 'width', 'height', 'resize', 'fit', 'quality', 'q', 'compress'];
    paramsToRemove.forEach((param) => urlObj.searchParams.delete(param));
    
    // Handle common CDN patterns (e.g., Cloudflare, Imgix)
    const pathSegments = urlObj.pathname.split('/');
    const cleanedSegments = pathSegments.map(segment => 
      segment.replace(/^(w\d+|h\d+|q\d+|-resize|-fit|-compress)$/i, '')
    ).filter(Boolean);
    urlObj.pathname = cleanedSegments.join('/');

    return urlObj.href;
  } catch (error) {
    console.error('Error stripping params:', error);
    return url;
  }
}

// Simulated web/X search (replace with real API calls if available)
async function simulatedWebSearch(query: string, originalUrl: string): Promise<ImageData[]> {
  // Placeholder: In a real implementation, use a web search API (e.g., Google Custom Search) or X API
  // For now, return an empty array since I can’t perform live searches here
  console.log(`Simulating search for: "${query}" based on ${originalUrl}`);
  return [];
}