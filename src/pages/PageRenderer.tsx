import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { pagesApi as basePagesApi } from '../api/pagesApi';
import {
  Block, BLOCK_CATALOG,
  Breakpoint
} from './admin/Pages/Builder/blockTypes';
import { WIDGETS } from '../widgets';
import { breakpoints } from '../builder/DynamicPages';

const pagesApi = basePagesApi as any;

const alignClass = (a: string) => a === 'center' ? 'text-center' : a === 'right' ? 'text-right' : 'text-left';

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

  // Use breakpoints from DynamicPages
  breakpoints.forEach((bpConfig) => {
    const bp = bpConfig.key;
    const props = responsive[bp];
    if (!props || Object.keys(props).length === 0) return;

    Object.entries(props).forEach(([key, val]) => {
      if (!val) return;
      let targetSelector = `#block-${blockId}`;
      let cleanKey = key;

      // Handle sub-selectors for prefixed props
      if (key.startsWith('content')) {
        targetSelector += ` .accordion-content`;
        cleanKey = key.replace('content', '').charAt(0).toLowerCase() + key.replace('content', '').slice(1);
      } else if (key.startsWith('desc')) {
        targetSelector += ` .image-box-desc`;
        cleanKey = key.replace('desc', '').charAt(0).toLowerCase() + key.replace('desc', '').slice(1);
      }

      let rule = '';
      if (cleanKey === 'fontSize') rule = `font-size: ${val} !important; `;
      if (cleanKey === 'fontWeight') rule = `font-weight: ${val} !important; `;
      if (cleanKey === 'textAlign') rule = `text-align: ${val} !important; `;
      if (cleanKey === 'lineHeight') rule = `line-height: ${val} !important; `;
      if (cleanKey === 'letterSpacing') rule = `letter-spacing: ${val} !important; `;
      if (cleanKey === 'maxWidth') rule = `max-width: ${val} !important; `;
      if (cleanKey === 'display') rule = `display: ${val} !important; `;
      if (cleanKey === 'flexDir') rule = `flex-direction: ${val} !important; `;
      if (cleanKey === 'flexWrap') rule = `flex-wrap: ${val} !important; `;
      if (cleanKey === 'gridCols') rule = `grid-template-columns: repeat(${val}, minmax(0, 1fr)) !important; `;
      if (cleanKey === 'gridRows') rule = `grid-template-rows: repeat(${val}, minmax(0, 1fr)) !important; `;
      if (cleanKey === 'gap') rule = `gap: ${val} !important; `;
      if (cleanKey === 'items') rule = `align-items: ${val} !important; `;
      if (cleanKey === 'justify') rule = `justify-content: ${val} !important; `;
      if (cleanKey === 'width') rule = `width: ${val} !important; `;
      if (cleanKey === 'maxWidthC') rule = `max-width: ${val} !important; `;
      if (cleanKey === 'colSpan') rule = `grid-column: span ${val} / span ${val} !important; `;
      if (cleanKey === 'pt') rule = `padding-top: ${val} !important; `;
      if (cleanKey === 'pr') rule = `padding-right: ${val} !important; `;
      if (cleanKey === 'pb') rule = `padding-bottom: ${val} !important; `;
      if (cleanKey === 'pl') rule = `padding-left: ${val} !important; `;
      if (cleanKey === 'mt') rule = `margin-top: ${val} !important; `;
      if (cleanKey === 'mr') rule = `margin-right: ${val} !important; `;
      if (cleanKey === 'mb') rule = `margin-bottom: ${val} !important; `;
      if (cleanKey === 'ml') rule = `margin-left: ${val} !important; `;
      if (cleanKey === 'boxShadow') rule = `box-shadow: ${val} !important; `;
      if (cleanKey === 'zIndex') rule = `z-index: ${val} !important; position: relative !important; `;
      if (cleanKey === 'visibility') rule = `display: ${val === 'hidden' ? 'none' : val} !important; `;
      if (cleanKey === 'rounded') rule = `border-radius: ${val} !important; `;
      if (cleanKey === 'overflow') rule = `overflow: ${val} !important; `;
      if (cleanKey === 'textTransform') rule = `text-transform: ${val} !important; `;
      if (cleanKey === 'wordSpacing') rule = `word-spacing: ${val} !important; `;
      if (cleanKey === 'height') rule = `height: ${val} !important; `;
      if (cleanKey === 'minWidth') rule = `min-width: ${val} !important; `;
      if (cleanKey === 'minHeight') rule = `min-height: ${val} !important; `;
      if (cleanKey === 'maxHeight') rule = `max-height: ${val} !important; `;
      if (cleanKey === 'flexWrap') rule = `flex-wrap: ${val} !important; `;
      if (rule) {
        let mediaQuery = '';
        const { minWidth, maxWidth } = bpConfig;

        // Handle base breakpoint (minWidth === 0, maxWidth !== null)
        // Handle sm breakpoint (minWidth > 0, maxWidth !== null)
        // Handle md breakpoint (minWidth > 0, maxWidth === null)
        if (minWidth === 0 && maxWidth !== null) {
          // Mobile (base): 0 to maxWidth
          mediaQuery = `@media (max-width: ${maxWidth}px) { ${targetSelector} { ${rule} } }\n`;
        } else if (minWidth !== null && maxWidth !== null) {
          // Tablet (sm): minWidth to maxWidth
          mediaQuery = `@media (min-width: ${minWidth}px) and (max-width: ${maxWidth}px) { ${targetSelector} { ${rule} } }\n`;
        } else if (minWidth !== null && maxWidth === null) {
          // Desktop (md): minWidth and up
          mediaQuery = `@media (min-width: ${minWidth}px) { ${targetSelector} { ${rule} } }\n`;
        }

        css += mediaQuery;
      }
    });
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
 * PageRenderer Component
 * Renders dynamic pages based on URL parameters (siteDomain and pageSlug)
 * Fetches page data from the backend and renders blocks based on language
 *
 * Route handling:
 *   /                     -> home page (slug = "home")
 *   /:siteDomain          -> home page for that site (slug = "home")
 *   /:siteDomain/:pageSlug -> specific page for that site
 */
const PageRenderer: React.FC = () => {
  const { siteDomain, pageSlug } = useParams<{ siteDomain?: string; pageSlug?: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<string>('en');
  const [error, setError] = useState<string | null>(null);

  // Reserved words that should NOT be treated as site domains
  const RESERVED_WORDS = ['admin', 'login', 'register', 'employer', 'api', 'unauthorized'];

  useEffect(() => {
    (async () => {
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

        const slugToFetch = pageSlug || 'home';
        const res = await pagesApi.getBySlug(slugToFetch, lang);

        let pageData = res.data.data || res.data;

        // --- Normalize content for the current language ---
        const normalizeContent = (raw: any) => {
          // Case 1: content is a JSON string (stored as JSON in database)
          if (typeof raw === 'string') {
            try {
              raw = JSON.parse(raw);
            } catch (e) {
              console.error('[PageRenderer] Content parse error:', e);
              return { elements: [] };
            }
          }

          // Case 2: content is already an object with elements array
          if (raw && raw.elements && Array.isArray(raw.elements)) {
            return raw;
          }

          // Case 3: content is a direct array (old format)
          if (Array.isArray(raw)) {
            return { elements: raw };
          }

          // Case 4: unknown / null / empty
          return { elements: [] };
        };

        // Parse English content
        if (pageData) {
          pageData.content = normalizeContent(pageData.content);
        }

        // Parse Arabic content if present
        if (pageData && pageData.content_ar !== undefined) {
          pageData.content_ar = normalizeContent(pageData.content_ar);
        }

        setPage(pageData);

        // Determine language from page data or default to 'en'
        if (pageData?.lang) {
          setLang(pageData.lang);
        } else if (pageData?.language) {
          setLang(pageData.language);
        }

        // SEO: Update document title
        if (pageData?.meta_title) {
          const pageTitle = lang === 'ar' ? pageData.meta_title_ar : pageData.meta_title;
          document.title = pageTitle || pageData.meta_title;

          // Meta description
          const pageDesc = lang === 'ar' ? pageData.meta_description_ar : pageData.meta_description;
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = pageDesc || pageData.meta_description || '';
        }

        // Keywords
        const keywordsData = pageData?.keywords;
        const pageKeywords = lang === 'ar' ? keywordsData?.ar : keywordsData?.en;
        if (pageKeywords && Array.isArray(pageKeywords) && pageKeywords.length > 0) {
          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = 'keywords';
            document.head.appendChild(metaKeywords);
          }
          metaKeywords.content = pageKeywords.join(', ');
        }

        // Schema.org JSON-LD
        const schemaData = pageData?.schema || pageData?.schema_data;
        if (schemaData) {
          const globalSchema = document.getElementById('seo-schema');
          let mergedSchema = schemaData;
          if (globalSchema) {
            try {
              const globalData = JSON.parse(globalSchema.textContent || '{}');
              mergedSchema = { ...globalData, ...schemaData };
            } catch (e) {}
          }
          let schemaScript = document.getElementById('seo-schema');
          if (!schemaScript) {
            schemaScript = document.createElement('script');
            schemaScript.id = 'seo-schema';
            schemaScript.type = 'application/ld+json';
            document.head.appendChild(schemaScript);
          }
          schemaScript.textContent = JSON.stringify(mergedSchema);
        }
      } catch (err) {
        console.error('[PageRenderer] Page fetch failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [pageSlug, siteDomain, lang]);

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
    const customStyleTag = p.customCss ? <style dangerouslySetInnerHTML={{ __html: p.customCss }} /> : null;
    const content = (() => {
      switch (block.type) {
        case 'container': {
          const styles = generateResponsiveStyles(block.id, p.responsive);
          const bw = p.borderWidth ? (isNaN(Number(p.borderWidth)) ? p.borderWidth : `${p.borderWidth}px`) : undefined;
          // Clean background image URL if present
          const bgImageUrl = p.bgImage ? `url(${cleanUrl(p.bgImage)}) center / ${p.bgSize ?? 'cover'} no-repeat` : (p.bgColor || 'transparent');
          const containerStyle: React.CSSProperties = {
            minHeight: p.minHeight, minWidth: p.minWidth, maxWidth: p.maxWidth, maxHeight: p.maxHeight,
            width: p.width, height: p.height, borderRadius: p.borderRadius, padding: p.padding,
            flexWrap: p.flexWrap as any,
            textAlign: p.textAlign as any,
            borderWidth: bw,
            borderColor: p.borderColor,
            borderStyle: p.borderStyle || (bw && bw !== '0px' ? 'solid' : 'none'),
            background: bgImageUrl, display: 'flex', flexDirection: 'column',
            boxShadow: p.boxShadow,
            zIndex: p.zIndex, position: (p.zIndex || p.zIndex === 0) ? 'relative' : undefined
          };
          return (
            <>
              {styles}
              <div id={`block-${block.id}`} style={containerStyle} className={`${p.customClass || ''}`}>
                {(block.children ?? []).map(renderBlock)}
              </div>
            </>
          );
        }
        case 'hero': return (
          <section key={block.id} id={p.customId || `block-${block.id}`} style={{ background: p.bgColor, color: p.textColor, minHeight: p.minHeight, boxShadow: p.boxShadow, zIndex: p.zIndex, position: (p.zIndex || p.zIndex === 0) ? 'relative' : undefined }} className={`w-full flex flex-col items-${p.align === 'center' ? 'center' : p.align === 'right' ? 'end' : 'start'} justify-center px-12 py-16 ${p.customClass || ''}`}>
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
              <div id={p.customId || `block-wrap-${block.id}`} className={`${alignClass(p.align)} ${p.customClass || ''}`}>
                <Tag
                  id={`block-${block.id}`}
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
                    zIndex: p.zIndex,
                    position: (p.zIndex || p.zIndex === 0) ? 'relative' : undefined,
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
              <div id={p.customId || `block-wrap-${block.id}`} className={`${alignClass(p.align)} ${p.customClass || ''}`}>
                <div id={`block-${block.id}`} className="prose max-w-none leading-relaxed" style={{ color: p.color, textDecoration: p.textDecoration, opacity: p.opacity ?? 1, minHeight: p.minHeight || undefined, boxShadow: p.boxShadow, textAlign: p.textAlign as any, zIndex: p.zIndex, position: (p.zIndex || p.zIndex === 0) ? 'relative' : undefined, ...typo }} dangerouslySetInnerHTML={{ __html: p.html }} />
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
              <div id={p.customId || `block-wrap-${block.id}`} className={`flex flex-col items-${p.align === 'center' ? 'center' : p.align === 'right' ? 'end' : 'start'} ${p.customClass || ''}`}>
                <img id={`block-${block.id}`} src={imageSrc} alt={p.alt} style={{
                  borderRadius: p.borderRadius,
                  boxShadow: p.boxShadow,
                  zIndex: p.zIndex,
                  position: (p.zIndex || p.zIndex === 0) ? 'relative' : undefined
                }} className="object-cover" />
                {p.caption && <p className="text-xs text-slate-400 mt-2 italic">{p.caption}</p>}
              </div>
            </React.Fragment>
          );
        }
        case 'button': {
          const styles = generateResponsiveStyles(block.id, p.responsive);
          const Icon = p.icon ? (LucideIcons as any)[p.icon] : null;
          const hoverStyle = `
            #block-${block.id}:hover {
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
              <style dangerouslySetInnerHTML={{ __html: hoverStyle }} />
              <div id={p.customId || `block-wrap-${block.id}`} className={`${alignClass(p.align)} ${p.customClass || ''}`}>
                <a
                  id={`block-${block.id}`}
                  href={p.url}
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
                    zIndex: p.zIndex,
                    position: (p.zIndex || p.zIndex === 0) ? 'relative' : undefined,
                    ...getTypoStyles(p)
                  }}
                >
                  {p.icon && p.iconPos === 'left' && Icon && <Icon size={p.iconSize || 18} color={p.iconColor || p.textColor} />}
                  {p.text}
                  {p.icon && p.iconPos === 'right' && Icon && <Icon size={p.iconSize || 18} color={p.iconColor || p.textColor} />}
                </a>
              </div>
            </React.Fragment>
          );
        }
        case 'divider': return (
          <div key={block.id} id={p.customId || `block-${block.id}`} className={`${p.customClass || ''}`} style={{ paddingTop: p.padding, paddingBottom: p.padding }}>
            <hr style={{ borderColor: p.color, borderWidth: p.thickness, borderStyle: p.style }} />
          </div>
        );
        case 'spacer': return <div key={block.id} id={p.customId || `block-${block.id}`} style={{ height: p.height }} className={p.customClass || ''} />;
        case 'card': return (
          <div key={block.id} id={p.customId || `block-${block.id}`} className={`${p.customClass || ''}`}>
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
              <div id={p.customId || `block-${block.id}`} className={`flex items-center ${p.customClass || ''}`} style={{ backgroundColor: p.bgColor, borderRadius: p.borderRadius, padding: p.padding, boxShadow: p.boxShadow }}>
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
              <div id={p.customId || `block-${block.id}`} style={{ backgroundColor: p.bgColor, borderRadius: p.borderRadius, padding: p.padding, flexDirection: p.flexDir as any, boxShadow: p.boxShadow }} className={`flex items-center ${p.customClass || ''}`}>
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
              <div id={p.customId || `block-wrap-${block.id}`} className={p.customClass || ''} style={{ zIndex: p.zIndex, position: (p.zIndex || p.zIndex === 0) ? 'relative' : undefined, boxShadow: p.boxShadow }}>
                {WidgetComponent ? <WidgetComponent {...p} lang={lang} /> : (
                  <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
                    Widget "{p.widgetName}" not found
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        }
        default: return null;
      }
    })();
    return <React.Fragment key={block.id}>{customStyleTag}{content}</React.Fragment>;
  };

  return (
    <div className={`min-h-screen bg-white ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Language Switcher */}
      {page.content_ar && page.content_ar.elements && page.content_ar.elements.length > 0 && page.content.elements && page.content.elements.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
      )}

      {/* Page Content - select content based on current language */}
      {(() => {
        const activeContent = lang === 'ar' ? (page.content_ar || page.content) : page.content;
        return activeContent?.elements && Array.isArray(activeContent.elements) && activeContent.elements.map(renderBlock);
      })()}
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
        id={`block-${block.id}`}
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
          boxShadow: p.boxShadow
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

export default PageRenderer;
