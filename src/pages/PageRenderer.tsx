import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { pagesApi as basePagesApi } from '../api/pagesApi';
import { templatesApi } from '../api/templatesApi';
import siteMenusApi from '../api/siteMenusApi';
import { updateFavicon } from '../utils/favicon';
import {
  Block, BLOCK_CATALOG,
  Breakpoint
} from './admin/Pages/Builder/blockTypes';
import { WIDGETS } from '../widgets';
import { breakpoints } from '../builder/DynamicPages';
import { propMap } from '../builder/registry/componentRegistry';
import DynamicIcon from '../icons';

const pagesApi = basePagesApi as any;

const alignClass = (a: string) => a === 'center' ? 'text-center' : a === 'right' ? 'text-right' : 'text-left';

/**
 * Normalize block ID to ensure it has the "block-" prefix
 * Handles both legacy IDs (without prefix) and new IDs (with prefix)
 */
const getBlockId = (id: string): string => {
  if (!id) return id;
  return id.startsWith('block-') ? id : `block-${id}`;
};

/**
 * Clean URL strings that may have JSON escape sequences
 * Handles cases where URLs come with \/ instead of just /
 */
const cleanUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return url;
  // Replace \/ with / (JSON escape sequences)
  return url.replace(/\\\//g, '/');
};

function generateResponsiveStyles(blockId: string, responsive: Record<string, Record<string, string>> | undefined) {
  if (!responsive) return null;

  let css = '';
  const normalizedBlockId = getBlockId(blockId);

  // Output order: md (default, no query) → base (max-width) → sm (min+max)
  const outputOrder = ['md', 'base', 'sm'];
  outputOrder.forEach((bp) => {
    const bpConfig = breakpoints.find(b => b.key === bp);
    if (!bpConfig) return;
    const props = responsive[bp];
    if (!props || Object.keys(props).length === 0) return;

    // ✅ Accumulate ALL rules for this breakpoint
    let allRules = '';
    let targetSelector = `#${normalizedBlockId}`;

    Object.entries(props).forEach(([key, val]) => {
      if (!val) return;
      let cleanKey = key;

      // Handle sub-selectors for prefixed props
      if (key.startsWith('content')) {
        targetSelector = `#${normalizedBlockId} .accordion-content`;
        cleanKey = key.replace('content', '').charAt(0).toLowerCase() + key.replace('content', '').slice(1);
      } else if (key.startsWith('desc')) {
        targetSelector = `#${normalizedBlockId} .image-box-desc`;
        cleanKey = key.replace('desc', '').charAt(0).toLowerCase() + key.replace('desc', '').slice(1);
      }

      // Use the comprehensive propMap to convert short-form to CSS property
      const mapping = propMap[cleanKey];
      if (!mapping) return;
      
      const cssProp = mapping.css;
      let rule = `${cssProp}: ${val} !important; `;
      
      // Special handling for visibility
      if (cleanKey === 'visibility') {
        const displayVal = val === 'hidden' ? 'none' : val;
        rule = `display: ${displayVal} !important; `;
      }
      
      // Special handling for grid properties
      if (cleanKey === 'gridCols') {
        rule = `grid-template-columns: repeat(${val}, minmax(0, 1fr)) !important; `;
      }
      if (cleanKey === 'gridRows') {
        rule = `grid-template-rows: repeat(${val}, minmax(0, 1fr)) !important; `;
      }
      if (cleanKey === 'colSpan') {
        rule = `grid-column: span ${val} / span ${val} !important; `;
      }

      if (rule) {
        allRules += rule; // ✅ Accumulate ALL rules
      }
    });
    
    // ✅ Create ONE CSS rule for this breakpoint with ALL properties
    if (allRules) {
      let mediaQuery = '';
      const { minWidth, maxWidth } = bpConfig;

      // Desktop-first approach:
      // - md (desktop, minWidth>0, maxWidth===null): no media query = default styles
      // - sm (tablet, minWidth>0, maxWidth!==null): @media (min-width) and (max-width)
      // - base (mobile, minWidth===0): @media (max-width)
      if (minWidth !== null && maxWidth === null) {
        // Desktop (md): no media query — applied as default
        mediaQuery = `${targetSelector} { ${allRules} }\n`;
      } else if (minWidth !== null && maxWidth !== null) {
        // Tablet (sm): minWidth to maxWidth
        mediaQuery = `@media (min-width: ${minWidth}px) and (max-width: ${maxWidth}px) { ${targetSelector} { ${allRules} } }\n`;
      } else if (minWidth === 0 && maxWidth !== null) {
        // Mobile (base): 0 to maxWidth
        mediaQuery = `@media (max-width: ${maxWidth}px) { ${targetSelector} { ${allRules} } }\n`;
      }

      css += mediaQuery;
    }
  });

  if (!css) return null;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

const getTypoStyles = (p: Record<string, any>, prefix: string = '') => ({
  fontSize: p[prefix + 'fontSize'] || undefined,
  fontWeight: p[prefix + 'fontWeight'] || undefined,
  textTransform: p[prefix + 'textTransform'] || undefined,
  letterSpacing: p[prefix + 'letterSpacing'] || undefined,
  wordSpacing: p[prefix + 'wordSpacing'] || undefined,
  lineHeight: p[prefix + 'lineHeight'] || undefined,
} as React.CSSProperties);

/**
 * Normalize legacy responsive data: expand short-form justify values in all elements
 * (between → space-between, start → flex-start, etc.)
 * Prevents invalid CSS like "justify-content: between" from being generated.
 */
const normalizeResponsiveJustify = (elements: any[]) => {
  const shortToFull: Record<string, string> = {
    'start': 'flex-start',
    'end': 'flex-end',
    'between': 'space-between',
    'around': 'space-around',
    'evenly': 'space-evenly',
  };
  const walk = (els: any[]) => {
    els.forEach((el: any) => {
      if (el.props?.responsive) {
        ['md', 'sm', 'base'].forEach(bp => {
          const val = el.props.responsive[bp]?.justify;
          if (val && shortToFull[val]) {
            el.props.responsive[bp].justify = shortToFull[val];
          }
        });
      }
      if (el.children) walk(el.children);
    });
  };
  walk(elements);
};

/**
 * PageRenderer Component
 * Renders dynamic pages based on URL parameters (siteDomain and pageSlug)
 * Fetches page data from the backend and renders blocks based on language
 *
 * Route handling:
 *   /                     -> home page (slug = "home") for default site
 *   /:siteDomain          -> Try as page slug for default site first, fallback to site domain home page
 *   /:siteDomain/:pageSlug -> specific page for that site
 *
 * The try-and-fallback approach handles the case where a URL segment could be
 * either a site domain OR a page slug for the default site.
 */
const PageRenderer: React.FC = () => {
  const { siteDomain, pageSlug } = useParams<{ siteDomain?: string; pageSlug?: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<string>('en');
  const [error, setError] = useState<string | null>(null);
  const [headerElements, setHeaderElements] = useState<any[] | null>(null);
  const [footerElements, setFooterElements] = useState<any[] | null>(null);
  const [siteMenus, setSiteMenus] = useState<any[]>([]);

  // Reserved words that should NOT be treated as site domains
  const RESERVED_WORDS = ['admin', 'login', 'register', 'employer', 'api', 'unauthorized'];

  useEffect(() => {
    const loadPage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if siteDomain is a reserved word
        if (siteDomain && RESERVED_WORDS.includes(siteDomain.toLowerCase())) {
          console.warn(`[PageRenderer] Reserved word detected: ${siteDomain}`);
          setError(`"${siteDomain}" is not a valid site domain`);
          setLoading(false);
          return;
        }

        let slugToFetch: string;
        let siteToUse: string | undefined;

        if (!siteDomain) {
          // No params - home page of default site
          slugToFetch = 'home';
          siteToUse = undefined;
        } else if (pageSlug) {
          // /siteDomain/pageSlug - it's a page in a specific site
          slugToFetch = pageSlug;
          siteToUse = siteDomain;
        } else {
          // /siteDomain - could be a site domain OR a page slug for default site
          // Try it as a page slug first (for default site)
          try {
            const res = await pagesApi.getBySlug(siteDomain, lang);
            let pageData = res.data.data || res.data;
            
            // --- Normalize content for the current language ---
            const normalizeContent = (raw: any) => {
              if (typeof raw === 'string') {
                try { raw = JSON.parse(raw); } catch (e) { return { elements: [] }; }
              }
              if (raw && raw.elements && Array.isArray(raw.elements)) { return raw; }
              if (Array.isArray(raw)) { return { elements: raw }; }
              return { elements: [] };
            };

            if (pageData) { pageData.content = normalizeContent(pageData.content); }
            if (pageData && pageData.content_ar !== undefined) { pageData.content_ar = normalizeContent(pageData.content_ar); }
            // Normalize legacy responsive data (between → space-between, etc.)
            if (pageData?.content?.elements) normalizeResponsiveJustify(pageData.content.elements);
            if (pageData?.content_ar?.elements) normalizeResponsiveJustify(pageData.content_ar.elements);
            setPage(pageData);

            if (pageData?.lang) { setLang(pageData.lang); } else if (pageData?.language) { setLang(pageData.language); }

            // SEO: Update document title
            if (pageData?.meta_title) {
              const pageTitle = lang === 'ar' ? pageData.meta_title_ar : pageData.meta_title;
              document.title = pageTitle || pageData.meta_title;

              // Meta description
              const pageDesc = lang === 'ar' ? pageData.meta_description_ar : pageData.meta_description;
              let metaDesc = document.querySelector('meta[name="description"]');
              if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
              metaDesc.content = pageDesc || pageData.meta_description || '';
            }

            // Keywords
            const keywordsData = pageData?.keywords;
            const pageKeywords = lang === 'ar' ? keywordsData?.ar : keywordsData?.en;
            if (pageKeywords && Array.isArray(pageKeywords) && pageKeywords.length > 0) {
              let metaKeywords = document.querySelector('meta[name="keywords"]');
              if (!metaKeywords) { metaKeywords = document.createElement('meta'); metaKeywords.name = 'keywords'; document.head.appendChild(metaKeywords); }
              metaKeywords.content = pageKeywords.join(', ');
            }

            // Schema.org JSON-LD
            const schemaData = pageData?.schema || pageData?.schema_data;
            if (schemaData) {
              const globalSchema = document.getElementById('seo-schema');
              let mergedSchema = schemaData;
              if (globalSchema) {
                try { const globalData = JSON.parse(globalSchema.textContent || '{}'); mergedSchema = { ...globalData, ...schemaData }; } catch (e) {}
              }
              let schemaScript = document.getElementById('seo-schema');
              if (!schemaScript) { schemaScript = document.createElement('script'); schemaScript.id = 'seo-schema'; schemaScript.type = 'application/ld+json'; document.head.appendChild(schemaScript); }
              schemaScript.textContent = JSON.stringify(mergedSchema);
            }

            setLoading(false);
            return; // Success! It was a page slug
          } catch (error: any) {
            // If 404, it might be a site domain - continue below
            if (error.response?.status !== 404) {
              throw error; // Re-throw if it's not a 404
            }
          }

          // It's a site domain - get home page for that site
          slugToFetch = 'home';
          siteToUse = siteDomain;
        }

        const res = await pagesApi.getBySlug(slugToFetch, lang, siteToUse);
        let pageData = res.data.data || res.data;

        // --- Normalize content for the current language ---
        const normalizeContent = (raw: any) => {
          if (typeof raw === 'string') {
            try { raw = JSON.parse(raw); } catch (e) { return { elements: [] }; }
          }
          if (raw && raw.elements && Array.isArray(raw.elements)) { return raw; }
          if (Array.isArray(raw)) { return { elements: raw }; }
          return { elements: [] };
        };

        if (pageData) { pageData.content = normalizeContent(pageData.content); }
        if (pageData && pageData.content_ar !== undefined) { pageData.content_ar = normalizeContent(pageData.content_ar); }
        // Normalize legacy responsive data (between → space-between, etc.)
        if (pageData?.content?.elements) normalizeResponsiveJustify(pageData.content.elements);
        if (pageData?.content_ar?.elements) normalizeResponsiveJustify(pageData.content_ar.elements);
        setPage(pageData);

        if (pageData?.lang) { setLang(pageData.lang); } else if (pageData?.language) { setLang(pageData.language); }

        // SEO: Update document title
        if (pageData?.meta_title) {
          const pageTitle = lang === 'ar' ? pageData.meta_title_ar : pageData.meta_title;
          document.title = pageTitle || pageData.meta_title;

          // Meta description
          const pageDesc = lang === 'ar' ? pageData.meta_description_ar : pageData.meta_description;
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
          metaDesc.content = pageDesc || pageData.meta_description || '';
        }

        // Keywords
        const keywordsData = pageData?.keywords;
        const pageKeywords = lang === 'ar' ? keywordsData?.ar : keywordsData?.en;
        if (pageKeywords && Array.isArray(pageKeywords) && pageKeywords.length > 0) {
          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (!metaKeywords) { metaKeywords = document.createElement('meta'); metaKeywords.name = 'keywords'; document.head.appendChild(metaKeywords); }
          metaKeywords.content = pageKeywords.join(', ');
        }

        // Schema.org JSON-LD
        const schemaData = pageData?.schema || pageData?.schema_data;
        if (schemaData) {
          const globalSchema = document.getElementById('seo-schema');
          let mergedSchema = schemaData;
          if (globalSchema) {
            try { const globalData = JSON.parse(globalSchema.textContent || '{}'); mergedSchema = { ...globalData, ...schemaData }; } catch (e) {}
          }
          let schemaScript = document.getElementById('seo-schema');
          if (!schemaScript) { schemaScript = document.createElement('script'); schemaScript.id = 'seo-schema'; schemaScript.type = 'application/ld+json'; document.head.appendChild(schemaScript); }
          schemaScript.textContent = JSON.stringify(mergedSchema);
        }

        setLoading(false);
      } catch (err) {
        console.error('[PageRenderer] Page fetch failed:', err);
        setError('Page not found');
        setLoading(false);
      }
    };

    loadPage();
  }, [siteDomain, pageSlug, lang]);

  // Fetch site header/footer when page loads
  useEffect(() => {
    const loadGlobals = async () => {
      const siteId = page?.site?.id;
      if (!siteId) {
        setHeaderElements(null);
        setFooterElements(null);
        return;
      }

      try {
        const res = await templatesApi.getGlobals(siteId);
        const data = res.data;
        
        // Extract elements from header
        if (data?.header?.content?.elements) {
          setHeaderElements(data.header.content.elements);
        } else {
          setHeaderElements(null);
        }

        // Extract elements from footer
        if (data?.footer?.content?.elements) {
          setFooterElements(data.footer.content.elements);
        } else {
          setFooterElements(null);
        }
      } catch (err) {
        console.warn('[PageRenderer] Failed to load header/footer:', err);
        setHeaderElements(null);
        setFooterElements(null);
      }
    };

    loadGlobals();
  }, [page?.site?.id]);

  // Fetch site menus when page loads (for menu blocks)
  useEffect(() => {
    const loadMenus = async () => {
      const siteId = page?.site?.id;
      if (!siteId) {
        setSiteMenus([]);
        return;
      }
      try {
        const data = await siteMenusApi.getMenus(siteId);
        setSiteMenus(data.menus || []);
      } catch (err) {
        console.warn('[PageRenderer] Failed to load site menus:', err);
        setSiteMenus([]);
      }
    };
    loadMenus();
  }, [page?.site?.id]);

  // Update favicon when page data changes (site favicon)
  useEffect(() => {
    if (page?.site?.favicon_url) {
      updateFavicon(page.site.favicon_url);
    } else {
      updateFavicon(null); // Revert to default
    }
  }, [page?.site?.favicon_url]);

  // Inject custom CSS and JS from page content
  const customJsCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Cleanup previous custom JS if exists
    if (customJsCleanupRef.current) {
      customJsCleanupRef.current();
      customJsCleanupRef.current = null;
    }

    if (!page?.content?.customJs && !page?.content_ar?.customJs) return;

    const customJs = lang === 'ar' ? (page.content_ar?.customJs || page.content?.customJs) : page.content?.customJs;
    
    if (customJs) {
      const script = document.createElement('script');
      script.id = 'page-custom-js';
      script.text = customJs;
      document.body.appendChild(script);
      
      // Store cleanup function
      customJsCleanupRef.current = () => {
        const existingScript = document.getElementById('page-custom-js');
        if (existingScript) {
          existingScript.remove();
        }
      };
    }

    return () => {
      if (customJsCleanupRef.current) {
        customJsCleanupRef.current();
        customJsCleanupRef.current = null;
      }
    };
  }, [page, lang]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={48} className="animate-spin text-[#2A69C6]" />
        <p className="text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 p-8 text-center">
      <h1 className="text-4xl font-black mb-4">Invalid Route</h1>
      <p className="text-slate-500 mb-8">{error}</p>
      <Link to="/" className="bg-[#2A69C6] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1e4b8f] transition">Back to Home</Link>
    </div>
  );

  if (!page) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 p-8 text-center">
      <h1 className="text-4xl font-black mb-4">404 - Page Not Found</h1>
      <p className="text-slate-500 mb-8">We couldn't find the page you're looking for.</p>
      <Link to="/" className="bg-[#2A69C6] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1e4b8f] transition">Back to Home</Link>
    </div>
  );

  const renderBlock = (block: Block): React.ReactNode => {
    const p = block.props;
    const content = (() => {
      switch (block.type) {
        case 'container': {
          const styles = generateResponsiveStyles(block.id, p.responsive);
          const bw = p.borderWidth ? (isNaN(Number(p.borderWidth)) ? p.borderWidth : `${p.borderWidth}px`) : undefined;
          // Clean background image URL if present
          const bgImageUrl = p.bgImage ? `url(${cleanUrl(p.bgImage)}) center / ${p.bgSize ?? 'cover'} no-repeat` : (p.bgColor || undefined);
          const containerStyle: React.CSSProperties = {
            minHeight: p.minHeight || undefined, 
            minWidth: p.minWidth || undefined, 
            maxWidth: p.maxWidth || undefined, 
            maxHeight: p.maxHeight || undefined,
            width: p.width || undefined, 
            height: p.height || undefined, 
            borderRadius: p.borderRadius || undefined, 
            padding: p.padding || undefined,
            flexWrap: p.flexWrap as any || undefined,
            textAlign: p.textAlign as any || undefined,
            borderWidth: bw || undefined,
            borderColor: p.borderColor || undefined,
            borderStyle: p.borderStyle || (bw && bw !== '0px' ? 'solid' : undefined),
            background: bgImageUrl,
            display: p.display || undefined,
            flexDirection: p.flexDirection || p.flexDir || undefined,
            justifyContent: (p.justifyContent || p.justify) as any || undefined,
            alignItems: (p.alignItems || p.items || p.align) as any || undefined,
            alignContent: p.alignContent as any || undefined,
            gap: p.gap || undefined,
            boxShadow: p.boxShadow || undefined,
            zIndex: p.zIndex ?? undefined, 
            position: (p.zIndex ?? null) !== null ? 'relative' : undefined
          };
          const Tag = p.tag === 'a' ? 'a' : p.tag || 'div';
          const linkProps = p.tag === 'a' ? { href: p.linkUrl || '#', target: p.linkTarget || '_self', ...(p.linkTarget === '_blank' ? { rel: 'noopener noreferrer' } : {}) } : {};

          return (
            <>
              {styles}
              <Tag id={getBlockId(block.id)} style={containerStyle} className={`${p.customClass || ''}`} {...linkProps}>
                {(block.children ?? []).map(renderBlock)}
              </Tag>
            </>
          );
        }
        case 'hero': return (
          <section key={block.id} id={p.customId || getBlockId(block.id)} style={{ background: p.bgColor, color: p.textColor, minHeight: p.minHeight, boxShadow: p.boxShadow, zIndex: p.zIndex ?? undefined, position: (p.zIndex ?? null) !== null ? 'relative' : undefined }} className={`w-full flex flex-col items-${p.align === 'center' ? 'center' : p.align === 'right' ? 'end' : 'start'} justify-center px-12 py-16 ${p.customClass || ''}`}>
            <h1 className={`text-4xl font-black mb-4 max-w-3xl ${alignClass(p.align)}`}>{p.title}</h1>
            <p className="text-lg opacity-80 mb-8 max-w-xl">{p.subtitle}</p>
            {p.ctaText && <a href={p.ctaUrl} className="bg-white text-slate-900 font-bold px-8 py-4 rounded-xl text-sm hover:shadow-lg transition transform hover:scale-105">{p.ctaText}</a>}
          </section>
        );
        case 'heading': {
          const sizes: Record<string, string> = { '1': 'text-5xl', '2': 'text-3xl', '3': 'text-2xl', '4': 'text-xl' };
          const Tag = `h${p.level || '2'}` as keyof React.JSX.IntrinsicElements;
          const styles = generateResponsiveStyles(block.id, p.responsive);
          const typo = getTypoStyles(p);
          // Clean background image URL if present
          const headingBg = p.bgImage ? `url(${cleanUrl(p.bgImage)}) center / ${p.bgSize || 'cover'} no-repeat` : p.bgColor;
          return (
            <React.Fragment key={block.id}>
              {styles}
              <div id={p.customId || `${getBlockId(block.id)}-wrap`} className={`${alignClass(p.align)} ${p.customClass || ''}`}>
                <Tag
                  id={getBlockId(block.id)}
                  className={`font-black ${(!typo.fontSize) ? (sizes[p.level] || 'text-3xl') : ''}`}
                  style={{
                    color: p.color,
                    textDecoration: p.textDecoration,
                    opacity: p.opacity ?? 1,
                    width: p.width || undefined,
                    height: p.height || undefined,
                    background: headingBg,
                    minHeight: p.minHeight || undefined,
                    borderRadius: p.borderRadius,
                    borderColor: p.borderColor,
                    borderWidth: p.borderWidth,
                    borderStyle: (p.borderWidth && p.borderWidth !== '0px') ? 'solid' : 'none',
                    textAlign: p.textAlign as any,
                    boxShadow: p.boxShadow,
                    zIndex: p.zIndex ?? undefined,
                    position: (p.zIndex ?? null) !== null ? 'relative' : undefined,
                    ...typo,
                  }}
                  dangerouslySetInnerHTML={{ __html: p.text || '' }}
                />
              </div>
            </React.Fragment>
          );
        }
        case 'paragraph': {
          const styles = generateResponsiveStyles(block.id, p.responsive);
          const typo = getTypoStyles(p);
          return (
            <React.Fragment key={block.id}>
              {styles}
                <div id={p.customId || `${getBlockId(block.id)}-wrap`} className={`${alignClass(p.align)} ${p.customClass || ''}`}>
                  <div id={getBlockId(block.id)} className="prose max-w-none leading-relaxed" style={{ color: p.color, textDecoration: p.textDecoration, opacity: p.opacity ?? 1, minHeight: p.minHeight || undefined, boxShadow: p.boxShadow, textAlign: p.textAlign as any, zIndex: p.zIndex ?? undefined, position: (p.zIndex ?? null) !== null ? 'relative' : undefined, ...typo }} dangerouslySetInnerHTML={{ __html: p.html }} />
                </div>
            </React.Fragment>
          );
        }
        case 'image': {
          const styles = generateResponsiveStyles(block.id, p.responsive);
          // Clean the image URL
          const imageSrc = cleanUrl(p.src);
          return (
            <React.Fragment key={block.id}>
              {styles}
              <div id={p.customId || `${getBlockId(block.id)}-wrap`} className={`flex flex-col items-${p.align === 'center' ? 'center' : p.align === 'right' ? 'end' : 'start'} ${p.customClass || ''}`}>
                <img id={getBlockId(block.id)} src={imageSrc} alt={p.alt} style={{
                  borderRadius: p.borderRadius,
                  boxShadow: p.boxShadow,
                  zIndex: p.zIndex ?? undefined,
                  position: (p.zIndex ?? null) !== null ? 'relative' : undefined
                }} className="object-cover" />
                {p.caption && <p className="text-xs text-slate-400 mt-2 italic">{p.caption}</p>}
              </div>
            </React.Fragment>
          );
        }
        case 'button': {
          // Strip display from responsive (it goes on wrapper, not <a>)
          const btnResponsive = p.responsive ? JSON.parse(JSON.stringify(p.responsive)) : undefined;
          let wrapperDisplayCSS = '';
          if (btnResponsive) {
            const wrapId = `${getBlockId(block.id)}-wrap`;
            const displayBpMap: Record<string, { min?: string; max?: string }> = {
              base: { max: '767px' },
              sm: { min: '768px', max: '1023px' },
              md: { min: '1024px' },
            };
            ['base', 'sm', 'md'].forEach((bp) => {
              if (btnResponsive[bp] && btnResponsive[bp].display !== undefined) {
                const val = btnResponsive[bp].display;
                const cfg = displayBpMap[bp];
                if (cfg.min && cfg.max) {
                  wrapperDisplayCSS += `@media (min-width: ${cfg.min}) and (max-width: ${cfg.max}) { #${wrapId} { display: ${val} !important; } }\n`;
                } else if (cfg.min) {
                  wrapperDisplayCSS += `@media (min-width: ${cfg.min}) { #${wrapId} { display: ${val} !important; } }\n`;
                } else if (cfg.max) {
                  wrapperDisplayCSS += `@media (max-width: ${cfg.max}) { #${wrapId} { display: ${val} !important; } }\n`;
                }
                delete btnResponsive[bp].display;
              }
            });
          }
          const styles = generateResponsiveStyles(block.id, btnResponsive);
          const Icon = p.icon ? (LucideIcons as any)[p.icon] : null;
          const hoverStyle = `
            #${getBlockId(block.id)}:hover {
              background-color: ${p.hoverBg || p.bgColor || 'initial'} !important;
              color: ${p.hoverColor || p.textColor || 'initial'} !important;
              border-color: ${p.hoverBorderColor || p.borderColor || 'initial'} !important;
              border-width: ${p.hoverBorderWidth || p.borderWidth || 'initial'} !important;
              border-style: ${p.hoverBorderStyle || p.borderStyle || 'solid'} !important;
              transform: scale(${p.hoverScale || 1}) !important;
            }
          `;
          return (
            <React.Fragment key={block.id}>
              {styles}
              {wrapperDisplayCSS && <style dangerouslySetInnerHTML={{ __html: wrapperDisplayCSS }} />}
              <style dangerouslySetInnerHTML={{ __html: hoverStyle }} />
              <div id={p.customId || `${getBlockId(block.id)}-wrap`} className={`${alignClass(p.align)} ${p.customClass || ''}`} style={{ display: p.responsive?.md?.display || undefined }}>
                {p.url && isInternalUrl(p.url) ? (
                  <Link
                    id={getBlockId(block.id)}
                    to={p.url}
                    className={`inline-flex items-center gap-2 font-bold transition-all duration-200 ${p.size === 'sm' ? 'px-4 py-2 text-xs' : p.size === 'lg' ? 'px-10 py-5 text-base' : 'px-8 py-4 text-sm'} rounded-xl`}
                    style={{
                      backgroundColor: p.bgColor,
                      borderRadius: p.borderRadius,
                      color: p.textColor,
                      borderWidth: p.borderWidth,
                      borderStyle: p.borderStyle,
                      borderColor: p.borderColor,
                      width: p.width || undefined,
                      maxWidth: p.maxWidth || undefined,
                      padding: p.padding,
                      justifyContent: 'center',
                      boxShadow: p.boxShadow,
                      zIndex: p.zIndex ?? undefined,
                      position: (p.zIndex ?? null) !== null ? 'relative' : undefined,
                      ...getTypoStyles(p)
                    }}
                  >
                    {p.icon && p.iconPos === 'left' && Icon && <Icon size={p.iconSize || 18} color={p.iconColor || p.textColor} />}
                    {p.text}
                    {p.icon && p.iconPos === 'right' && Icon && <Icon size={p.iconSize || 18} color={p.iconColor || p.textColor} />}
                  </Link>
                ) : (
                  <a
                    id={getBlockId(block.id)}
                    href={p.url || '#'}
                    target={p.url && !p.url.startsWith('#') ? '_blank' : undefined}
                    rel={p.url && !p.url.startsWith('#') ? 'noopener noreferrer' : undefined}
                    className={`inline-flex items-center gap-2 font-bold transition-all duration-200 ${p.size === 'sm' ? 'px-4 py-2 text-xs' : p.size === 'lg' ? 'px-10 py-5 text-base' : 'px-8 py-4 text-sm'} rounded-xl`}
                    style={{
                      backgroundColor: p.bgColor,
                      borderRadius: p.borderRadius,
                      color: p.textColor,
                      borderWidth: p.borderWidth,
                      borderStyle: p.borderStyle,
                      borderColor: p.borderColor,
                      width: p.width || undefined,
                      maxWidth: p.maxWidth || undefined,
                      padding: p.padding,
                      justifyContent: 'center',
                      boxShadow: p.boxShadow,
                      zIndex: p.zIndex ?? undefined,
                      position: (p.zIndex ?? null) !== null ? 'relative' : undefined,
                      ...getTypoStyles(p)
                    }}
                  >
                    {p.icon && p.iconPos === 'left' && Icon && <Icon size={p.iconSize || 18} color={p.iconColor || p.textColor} />}
                    {p.text}
                    {p.icon && p.iconPos === 'right' && Icon && <Icon size={p.iconSize || 18} color={p.iconColor || p.textColor} />}
                  </a>
                )}
              </div>
            </React.Fragment>
          );
        }
        case 'divider': return (
          <div key={block.id} id={p.customId || getBlockId(block.id)} className={`${p.customClass || ''}`} style={{ paddingTop: p.padding, paddingBottom: p.padding, zIndex: p.zIndex ?? undefined, position: (p.zIndex ?? null) !== null ? 'relative' : undefined }}>
            <hr style={{ borderColor: p.color, borderWidth: p.thickness, borderStyle: p.style }} />
          </div>
        );
        case 'spacer': return <div key={block.id} id={p.customId || getBlockId(block.id)} style={{ height: p.height, zIndex: p.zIndex ?? undefined, position: (p.zIndex ?? null) !== null ? 'relative' : undefined }} className={p.customClass || ''} />;
        case 'card': return (
          <div key={block.id} id={p.customId || getBlockId(block.id)} className={`${p.customClass || ''}`} style={{ zIndex: p.zIndex ?? undefined, position: (p.zIndex ?? null) !== null ? 'relative' : undefined }}>
            <div style={{ background: p.bgColor, boxShadow: p.boxShadow || (p.shadow ? '0 4px 24px rgba(0,0,0,0.08)' : 'none') }} className="rounded-2xl p-6 border border-gray-100">
              <div className="w-8 h-1 rounded-full mb-4" style={{ background: p.accentColor }} />
              <h3 className="font-bold text-slate-800 text-lg mb-2">{p.title}</h3>
              <p className="text-slate-500 text-sm">{p.body}</p>
            </div>
          </div>
        );
        case 'listItem': {
          const styles = generateResponsiveStyles(block.id, p.responsive);
          const isImage = p.iconType === 'image' || (p.icon && (p.icon.startsWith('http') || p.icon.startsWith('/') || p.icon.includes('.')));
          const Icon = (!isImage && p.icon) ? (LucideIcons as any)[p.icon] : null;
          // Clean icon URL if it's an image
          const listItemIcon = cleanUrl(p.icon);
          return (
            <React.Fragment key={block.id}>
              {styles}
              <div id={p.customId || getBlockId(block.id)} className={`flex items-center ${p.customClass || ''}`} style={{ backgroundColor: p.bgColor, borderRadius: p.borderRadius, padding: p.padding, boxShadow: p.boxShadow, zIndex: p.zIndex ?? undefined, position: (p.zIndex ?? null) !== null ? 'relative' : undefined }}>
                <div className="flex items-center" style={{ gap: p.gap }}>
                  <div className="shrink-0 flex items-center justify-center" style={{ width: p.iconSize || '24px', height: p.iconSize || '24px' }}>
                    {(!isImage && Icon) ? (
                      <Icon size={p.iconSize} color={p.iconColor} />
                    ) : (
                      p.icon && <img src={listItemIcon} alt="" className="w-full h-full object-contain" />
                    )}
                  </div>
                  <span style={{ color: p.textColor, ...getTypoStyles(p) }}>{p.text}</span>
                </div>
              </div>
            </React.Fragment>
          );
        }
        case 'imageBox': {
          const styles = generateResponsiveStyles(block.id, p.responsive);
          const Tag = `h${p.titleLevel || '4'}` as keyof React.JSX.IntrinsicElements;
          // Clean image URL
          const imageBoxSrc = cleanUrl(p.image);
          return (
            <React.Fragment key={block.id}>
              {styles}
              <div id={p.customId || getBlockId(block.id)} style={{ backgroundColor: p.bgColor, borderRadius: p.borderRadius, padding: p.padding, flexDirection: p.flexDir as any, boxShadow: p.boxShadow, zIndex: p.zIndex ?? undefined, position: (p.zIndex ?? null) !== null ? 'relative' : undefined }} className={`flex items-center ${p.customClass || ''}`}>
                <div className="shrink-0" style={{ width: p.imageWidth }}>
                  {p.image ? <img src={imageBoxSrc} alt={p.title} className="w-full h-auto" style={{ borderRadius: p.borderRadius }} /> : <div className="w-full h-32 bg-slate-100 rounded-xl" />}
                </div>
                <div className="flex-1 flex flex-col" style={{ gap: '4px', marginLeft: p.flexDir === 'row' ? p.gap : '0', marginRight: p.flexDir === 'row-reverse' ? p.gap : '0', marginTop: p.flexDir === 'column' ? p.gap : '0', marginBottom: p.flexDir === 'column-reverse' ? p.gap : '0' }}>
                  <Tag className="font-bold m-0 leading-tight image-box-title" style={{ color: p.textColor, ...getTypoStyles(p) }}>{p.title}</Tag>
                  <div className="opacity-80 text-xs leading-relaxed image-box-desc" style={{ color: p.textColor, ...getTypoStyles(p, 'desc') }}>{p.text}</div>
                </div>
              </div>
            </React.Fragment>
          );
        }
        case 'accordionItem': return <AccordionItem block={block} />;
        case 'widget': {
          const WidgetComponent = p.widgetName && WIDGETS[p.widgetName] ? WIDGETS[p.widgetName] : null;
          return (
            <React.Fragment key={block.id}>
              <div id={p.customId || `block-wrap-${block.id}`} className={p.customClass || ''} style={{ zIndex: p.zIndex ?? undefined, position: (p.zIndex ?? null) !== null ? 'relative' : undefined, boxShadow: p.boxShadow }}>
                {WidgetComponent ? <WidgetComponent {...p} lang={lang} /> : (
                  <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
                    Widget "{p.widgetName}" not found
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        }
        case 'iconElement': {
          return <DynamicIcon {...p} id={block.id} />;
        }
        case 'counter': return <CounterBlock block={block} />;
        case 'menu': {
          return <MenuBlock block={block} siteMenus={siteMenus} lang={lang} />;
        }
        default: return null;
      }
    })();
    return <React.Fragment key={block.id}>{content}</React.Fragment>;
  };

  return (
    <div className={`min-h-screen bg-white ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Global Site CSS */}
      {page?.site?.global_css && (
        <style id="site-global-css" dangerouslySetInnerHTML={{ __html: page.site.global_css }} />
      )}

      {/* Custom CSS injection */}
      {(() => {
        const activeContent = lang === 'ar' ? (page.content_ar || page.content) : page.content;
        if (activeContent?.customCss) {
          return <style dangerouslySetInnerHTML={{ __html: activeContent.customCss }} />;
        }
        return null;
      })()}

      {/* Site Header (from template) */}
      {headerElements && headerElements.length > 0 && (
        <header className="site-header">
          {headerElements.map(renderBlock)}
        </header>
      )}

      {/* Page Content - select content based on current language */}
      {(() => {
        const activeContent = lang === 'ar' ? (page.content_ar || page.content) : page.content;
        return activeContent?.elements && Array.isArray(activeContent.elements) && activeContent.elements.map(renderBlock);
      })()}

      {/* Site Footer (from template) */}
      {footerElements && footerElements.length > 0 && (
        <footer className="site-footer">
          {footerElements.map(renderBlock)}
        </footer>
      )}
    </div>
  );
};

function AccordionItem({ block }: { block: Block }) {
  const p = block.props;
  const [isOpen, setIsOpen] = useState(false);
  const Icon = p.icon && (LucideIcons as any)[p.icon] ? (LucideIcons as any)[p.icon] : LucideIcons.ChevronDown;
  const bColor = p.borderColor || '#e2e8f0';
  const styles = generateResponsiveStyles(block.id, p.responsive);

  return (
    <React.Fragment>
      {styles}
      <div
        id={getBlockId(block.id)}
        className="overflow-hidden mb-1"
        style={{
          borderStyle: 'solid',
          borderColor: bColor,
          borderTopWidth: p.borderTopWidth || '0px',
          borderRightWidth: p.borderRightWidth || '0px',
          borderBottomWidth: p.borderBottomWidth || '0px',
          borderLeftWidth: p.borderLeftWidth || '0px',
          borderRadius: p.borderRadius,
          width: p.width || undefined,
          height: p.height || undefined,
          textAlign: p.textAlign as any,
          boxShadow: p.boxShadow,
          zIndex: p.zIndex ?? undefined,
          position: (p.zIndex ?? null) !== null ? 'relative' : undefined
        }}
      >
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between cursor-pointer transition-colors px-1 accordion-title"
          style={{ backgroundColor: p.titleBgColor, color: p.titleTextColor, padding: p.titlePadding }}
        >
          <span className="font-bold text-sm" style={getTypoStyles(p)}>{p.title}</span>
          <div
            id={`icon-wrap-${block.id}`}
            className={`shrink-0 transition-transform duration-300 flex items-center justify-center icon-wrap ${isOpen ? 'rotate-180' : ''}`}
            style={{ width: p.iconWidth || '24px', height: p.iconHeight || '24px' }}
          >
            <Icon size={p.iconSize || 16} color={p.iconColor || p.titleTextColor} />
          </div>
        </div>
        {isOpen && (
          <div className="transition-all accordion-content" style={{ backgroundColor: p.contentBgColor, color: p.contentTextColor, padding: p.padding, borderTop: `1px solid ${bColor}` }}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={getTypoStyles(p, 'content')}>{p.text}</p>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

function CounterBlock({ block }: { block: Block }) {
  const p = block.props;
  const styles = generateResponsiveStyles(block.id, p.responsive);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = parseInt(p.value) || 1000;
    const durationMs = (p.duration || 2) * 1000;
    const step = target / (durationMs / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCount(Math.floor(current));
    }, 16);

    return () => clearInterval(timer);
  }, [p.value, p.duration]);

  return (
    <>
      {styles}
      <div
        id={getBlockId(block.id)}
        style={{
          backgroundColor: p.bgColor || undefined,
          padding: p.padding || '16px',
          textAlign: (p.textAlign || p.alignment || 'center') as any,
          opacity: (p.opacity !== undefined && p.opacity !== null) ? (p.opacity <= 1 ? p.opacity : p.opacity / 100) : undefined,
          boxShadow: p.boxShadow || undefined,
          zIndex: p.zIndex ?? undefined,
          position: (p.zIndex ?? null) !== null ? 'relative' : undefined,
        }}
        className={p.customClass || ''}
      >
        <span style={{
          color: p.numberColor || '#000000',
          fontSize: p.fontSize || undefined,
          fontWeight: p.fontWeight || undefined,
        }}>
          {p.prefix || ''}{count}{p.suffix || ''}
        </span>
      </div>
    </>
  );
}

/** Check if a URL should use client-side routing (Link) vs a regular <a> tag */
function isInternalUrl(url: string): boolean {
  if (!url || url.startsWith('#')) return false;
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return false;
  if (url.startsWith('//')) return false; // protocol-relative
  if (url.startsWith('/')) return true;   // relative path → internal
  try {
    const parsed = new URL(url);
    return parsed.hostname === window.location.hostname;
  } catch {
    // Invalid URL (e.g. a bare path without leading /) → treat as external
    return false;
  }
}

function MenuBlock({ block, siteMenus, lang }: { block: Block; siteMenus: any[]; lang: string }) {
  const p = block.props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  // Recalculate dropdown position on open, scroll, and resize
  const updateDropdownPosition = useCallback(() => {
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect();
      setDropdownTop(rect.bottom);
    }
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      updateDropdownPosition();
    }
  }, [mobileOpen, updateDropdownPosition]);

  useEffect(() => {
    if (!mobileOpen) return;
    window.addEventListener('scroll', updateDropdownPosition, { passive: true });
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [mobileOpen, updateDropdownPosition]);

  const selectedMenu = siteMenus.find((m: any) => m.name === p.menuId);
  const links = selectedMenu?.links || [];

  // Strip justify from responsive before CSS generation — we handle it inline
  const menuResponsive = p.responsive ? JSON.parse(JSON.stringify(p.responsive)) : undefined;
  if (menuResponsive) {
    ['md', 'sm', 'base'].forEach((bp: string) => {
      if (menuResponsive[bp]) delete menuResponsive[bp].justify;
    });
  }
  const styles = generateResponsiveStyles(block.id, menuResponsive);

  // Hover style via <style> tag
  const hoverStyle = p.hoverColor ? `
    #${getBlockId(block.id)} a:hover {
      color: ${p.hoverColor} !important;
    }
  ` : '';

  // Map short-form justify values to CSS justify-content values
  const justifyValueMap: Record<string, string> = {
    'start': 'flex-start',
    'center': 'center',
    'end': 'flex-end',
    'between': 'space-between',
    'around': 'space-around',
    'evenly': 'space-evenly',
  };

  const justifyFromResponsive = p.responsive?.md?.justify || p.responsive?.base?.justify || p.responsive?.sm?.justify;
  const mappedJustify = justifyFromResponsive ? (justifyValueMap[justifyFromResponsive] || justifyFromResponsive) : undefined;

  // Responsive-aware textAlign: top-level prop → responsive (desktop-first) → default
  const textAlignFromResponsive = p.responsive?.md?.textAlign || p.responsive?.sm?.textAlign || p.responsive?.base?.textAlign;
  const textAlignValue = p.textAlign || p.align || textAlignFromResponsive || 'left';

  const flexJustifyContent = mappedJustify || (textAlignValue === 'center' ? 'center' : textAlignValue === 'right' ? 'flex-end' : 'flex-start');

  // Collapse breakpoint behavior
  const collapseBp: string = p.collapseBreakpoint || 'none';
  const hasCollapse = collapseBp !== 'none';
  const blockId = p.customId || getBlockId(block.id);

   // Generate collapse CSS
  let collapseStyle = '';
  if (hasCollapse) {
    const maxWidth = collapseBp === '1024px' ? '1023px' : '767px';
    const dropdownBg = p.bgColor || '#ffffff';
    collapseStyle = `
      @media (max-width: ${maxWidth}) {
        #${blockId} .menu-links { display: none !important; }
        #${blockId}.menu-open .menu-links {
          display: flex !important;
          flex-direction: column !important;
          padding: 8px 0;
          border-top: 1px solid rgba(0,0,0,0.08);
          background: ${dropdownBg};
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-radius: 0 0 8px 8px;
          z-index: 100;
          gap: 2px !important;
          animation: menuFadeIn 0.25s ease;
        }
        #${blockId}.menu-open .menu-links a {
          padding: 12px 16px !important;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        #${blockId} .menu-links a:last-child { border-bottom: none; }
        #${blockId} .menu-toggle { display: inline-flex !important; }
      }
      @media (min-width: ${collapseBp}) {
        #${blockId} .menu-toggle { display: none !important; }
      }
      @keyframes menuFadeIn {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }

  return (
    <>
      {styles}
      {collapseStyle && <style dangerouslySetInnerHTML={{ __html: collapseStyle }} />}
      {hoverStyle && <style dangerouslySetInnerHTML={{ __html: hoverStyle }} />}
        <nav
         ref={navRef}
         id={blockId}
         className={`${p.customClass || ''}${mobileOpen && hasCollapse ? ' menu-open' : ''}`}
        style={{
          backgroundColor: p.bgColor || undefined,
          textAlign: textAlignValue as any,
          boxShadow: p.boxShadow || undefined,
          zIndex: p.zIndex ?? undefined,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          paddingTop: p.pt || undefined,
          paddingRight: p.pr || undefined,
          paddingBottom: p.pb || undefined,
          paddingLeft: p.pl || undefined,
          marginTop: p.mt || undefined,
          marginRight: p.mr || undefined,
          marginBottom: p.mb || undefined,
          marginLeft: p.ml || undefined,
          opacity: (p.opacity !== undefined && p.opacity !== null) ? (p.opacity <= 1 ? p.opacity : p.opacity / 100) : undefined,
        }}
      >
        {p.menuId && selectedMenu ? (
          <>
            {/* Mobile toggle button */}
            {hasCollapse && (
              <button
                className="menu-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: p.textColor || '#000000',
                  marginLeft: 'auto',
                }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <LucideIcons.X size={24} />
                ) : (
                  <LucideIcons.Menu size={24} />
                )}
              </button>
            )}
            <div className="menu-links" style={{
              display: 'flex',
              flexDirection: (p.menuDirection === 'vertical' ? 'column' : 'row') as any,
              gap: p.gap || '24px',
              justifyContent: flexJustifyContent as any,
              ...(mobileOpen && hasCollapse ? {
                position: 'fixed',
                top: dropdownTop,
                left: 0,
                width: '100vw',
              } : {}),
            }}>
              {links.map((link: any, index: number) => {
                const linkLabel = lang === 'ar' ? (link.label_ar || link.label_en) : (link.label_en || link.label_ar);
                const linkStyle: React.CSSProperties = {
                  padding: '8px 0',
                  color: p.textColor || '#000000',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  fontWeight: p.fontWeight || undefined,
                  fontFamily: p.fontFamily || undefined,
                  textTransform: (p.textTransform && p.textTransform !== 'none') ? p.textTransform : undefined,
                };
                const handleClick = () => {
                  if (hasCollapse) setMobileOpen(false);
                };

                if (link.url && isInternalUrl(link.url)) {
                  return (
                    <Link
                      key={index}
                      to={link.url}
                      style={linkStyle}
                      onClick={handleClick}
                    >
                      {linkLabel}
                    </Link>
                  );
                }

                return (
                  <a
                    key={index}
                    href={link.url || '#'}
                    target={link.url && !link.url.startsWith('#') ? '_blank' : undefined}
                    rel={link.url && !link.url.startsWith('#') ? 'noopener noreferrer' : undefined}
                    style={linkStyle}
                    onClick={handleClick}
                  >
                    {linkLabel}
                  </a>
                );
              })}
            </div>
          </>
        ) : p.menuId && !selectedMenu ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#f59e0b' }}>
            Menu &quot;{p.menuId}&quot; not found
          </div>
        ) : null}
      </nav>
    </>
  );
}

export default PageRenderer;
