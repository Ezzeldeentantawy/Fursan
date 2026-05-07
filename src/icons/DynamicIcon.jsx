/**
 * DynamicIcon — Performant async icon renderer for the page builder.
 *
 * Accepts the full props object from a page JSON iconElement directly.
 * Handles:
 *   - Async icon resolution via IconRegistry (dynamic imports)
 *   - Multi-pack support (lucide, fa, md, io, bs, hi, ai, fi, etc.)
 *   - Image source fallback (source === 'image' or imageUrl)
 *   - customCss injection into a scoped <style> tag
 *   - Responsive padding overrides from the `responsive` prop
 *   - Skeleton placeholder during loading (no layout shift)
 *   - Link wrapping (linkUrl)
 *   - Full prop memoization via React.memo + custom comparator
 *   - Legacy schema compat (source, reactIcon, imageUrl)
 *
 * Usage in PageRenderer:
 *   <DynamicIcon {...block.props} id={block.id} />
 */

import React, { useEffect, useMemo } from 'react';
import { useIconResolver } from './useIconResolver';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a CSS size value like "35px", "2rem", "100%" into a number.
 * Falls back to the default if parsing fails.
 */
function parseSize(val, defaultVal = 32) {
  if (!val && val !== 0) return defaultVal;
  if (typeof val === 'number') return val;
  const num = parseInt(String(val), 10);
  return isNaN(num) ? defaultVal : num;
}

/**
 * Normalize opacity: old schema stores 0-1, new schema stores 0-100.
 */
function normalizeOpacity(val) {
  if (val === undefined || val === null) return undefined;
  return val <= 1 ? val : val / 100;
}

// ---------------------------------------------------------------------------
// DynamicIcon
// ---------------------------------------------------------------------------

const DynamicIcon = React.memo(
  ({
    // Core icon props (new schema)
    icon,
    iconType,
    iconSize,
    iconColor,

    // Container styling
    bgColor,
    borderRadius,
    padding,
    boxShadow,
    zIndex,
    opacity,

    // Identifiers
    id,
    customClass,
    customId,

    // CSS / effects
    customCss,

    // Responsive overrides
    responsive,

    // Link
    linkUrl,

    // Legacy schema fallbacks
    source,
    reactIcon,
    imageUrl,

    // Extra style passthrough
    style,

    // Alignment
    alignment,
  }) => {
    // ---- Normalise props (new schema preferred, fall back to legacy) ----
    const resolvedIconType =
      iconType ||
      (source === 'lucide'
        ? 'lucide'
        : source === 'react'
          ? 'fa'
          : source) ||
      null;

    const resolvedIconName = icon || reactIcon || null;
    const isImage = source === 'image' || !!imageUrl || resolvedIconType === 'image';
    const elementId = customId || id || 'icon-element';
    const numericSize = parseSize(iconSize, 32);

    // ---- Async icon resolution ----
    const { Icon, loading } = useIconResolver(
      isImage ? null : resolvedIconType,
      isImage ? null : resolvedIconName,
    );

    // ---- Custom CSS injection (scoped to elementId) ----
    useEffect(() => {
      if (!customCss) return;

      const styleId = `icon-style-${elementId}`;
      let tag = document.getElementById(styleId);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = styleId;
        document.head.appendChild(tag);
      }
      tag.textContent = customCss;

      return () => {
        const existing = document.getElementById(styleId);
        if (existing) existing.remove();
      };
    }, [customCss, elementId]);

    // ---- Responsive padding/gap styles ----
    const responsiveStyleTag = useMemo(() => {
      if (!responsive) return null;

      let css = '';

      const bpConfig = [
        { key: 'md', query: '(min-width: 768px)' },
        { key: 'lg', query: '(min-width: 1024px)' },
      ];

      for (const { key, query } of bpConfig) {
        const bp = responsive[key];
        if (!bp) continue;

        const rules = [];
        if (bp.pt) rules.push(`padding-top: ${bp.pt}`);
        if (bp.pr) rules.push(`padding-right: ${bp.pr}`);
        if (bp.pb) rules.push(`padding-bottom: ${bp.pb}`);
        if (bp.pl) rules.push(`padding-left: ${bp.pl}`);
        if (bp.mt) rules.push(`margin-top: ${bp.mt}`);
        if (bp.mr) rules.push(`margin-right: ${bp.mr}`);
        if (bp.mb) rules.push(`margin-bottom: ${bp.mb}`);
        if (bp.ml) rules.push(`margin-left: ${bp.ml}`);
        if (bp.gap) rules.push(`gap: ${bp.gap}`);
        if (bp.width) rules.push(`width: ${bp.width}`);
        if (bp.height) rules.push(`height: ${bp.height}`);

        if (rules.length > 0) {
          css += `@media ${query} { #${CSS.escape(elementId)} { ${rules.join('; ')} } }`;
        }
      }

      if (!css) return null;
      return <style>{css}</style>;
    }, [responsive, elementId]);

    // ---- Alignment wrapper (always present for consistent alignment control) ----
    const alignValue = alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start';

    // ---- Container style ----
    const containerStyle = useMemo(
      () => ({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor || undefined,
        borderRadius: borderRadius || undefined,
        padding: padding || undefined,
        boxShadow: boxShadow || undefined,
        zIndex: zIndex ?? undefined,
        position: zIndex != null ? 'relative' : undefined,
        opacity: normalizeOpacity(opacity),
        ...style,
      }),
      [bgColor, borderRadius, padding, boxShadow, zIndex, opacity, style],
    );

    // ---- Icon content ----
    const iconContent = (() => {
      // Image source
      if (isImage && imageUrl) {
        return (
          <img
            src={imageUrl}
            alt=""
            style={{
              width: numericSize,
              height: numericSize,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        );
      }

      // Loading state — skeleton placeholder prevents layout shift
      if (loading) {
        return (
          <span
            style={{
              width: numericSize,
              height: numericSize,
              display: 'inline-block',
            }}
            aria-hidden="true"
          />
        );
      }

      // Resolved icon component
      if (Icon) {
        return <Icon size={numericSize} color={iconColor || undefined} />;
      }

      // Fallback when icon name is invalid or pack failed to load
      return (
        <span
          style={{
            width: numericSize,
            height: numericSize,
            display: 'inline-block',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
          }}
          aria-hidden="true"
        />
      );
    })();

    // Optional link wrapper
    const inner = linkUrl ? (
      <a
        href={linkUrl}
        style={{
          display: 'inline-flex',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        {iconContent}
      </a>
    ) : (
      iconContent
    );

    const iconElement = (
      <>
        {responsiveStyleTag}
        <span
          id={elementId}
          className={customClass || undefined}
          style={containerStyle}
        >
          {inner}
        </span>
      </>
    );

    return (
      <div style={{ display: 'flex', justifyContent: alignValue, width: '100%' }}>
        {iconElement}
      </div>
    );
  },
  // ---- Custom comparator: shallow compare all icon-relevant props ----
  (prev, next) =>
    prev.icon === next.icon &&
    prev.iconType === next.iconType &&
    prev.iconSize === next.iconSize &&
    prev.iconColor === next.iconColor &&
    prev.bgColor === next.bgColor &&
    prev.borderRadius === next.borderRadius &&
    prev.padding === next.padding &&
    prev.boxShadow === next.boxShadow &&
    prev.customCss === next.customCss &&
    prev.customClass === next.customClass &&
    prev.customId === next.customId &&
    prev.zIndex === next.zIndex &&
    prev.opacity === next.opacity &&
    prev.source === next.source &&
    prev.reactIcon === next.reactIcon &&
    prev.imageUrl === next.imageUrl &&
    prev.linkUrl === next.linkUrl &&
    prev.alignment === next.alignment &&
    prev.id === next.id &&
    JSON.stringify(prev.responsive) === JSON.stringify(next.responsive),
);

DynamicIcon.displayName = 'DynamicIcon';

export default DynamicIcon;
