/**
 * Page Builder - Main Component
 * Full-featured page builder with drag-and-drop, bilingual support, and rich text editing
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pagesApi } from '../../../../api/pagesApi.js';
import { useSite } from '../../../../hooks/useSite.tsx';
import {
  BLOCK_TYPES,
  BLOCK_DEFINITIONS,
  getBlockDefinition,
  createBlock,
} from './blockTypes';
import {
  DndContextWrapper,
  blockHelpers,
  SortableItemWrapper,
} from '../../Builder/sharedHelpers';

// TipTap imports (ensure @tiptap/react and related packages are installed)
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';

// Icons (using inline SVG for simplicity - can be replaced with icon library)
const Icons = {
  drag: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 19V17H9V19H7ZM7 14V12H9V14H7ZM7 9V7H9V9H7ZM11 19V17H13V19H11ZM11 14V12H13V14H11ZM11 9V7H13V9H11ZM15 19V17H17V19H15ZM15 14V12H17V14H15ZM15 9V7H17V9H15Z" />
    </svg>
  ),
  edit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" />
    </svg>
  ),
  delete: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" />
    </svg>
  ),
  add: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
    </svg>
  ),
  preview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" />
    </svg>
  ),
  save: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM19 19H5V5H16.17L19 7.83V19ZM12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12ZM6 6H15V10H6V6Z" />
    </svg>
  ),
  close: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
    </svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" />
    </svg>
  ),
  chevronUp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" />
    </svg>
  ),
  copy: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" />
    </svg>
  ),
  moveUp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" />
    </svg>
  ),
  moveDown: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" />
    </svg>
  ),
  globe: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM6.5 9C7.33 9 8 8.33 8 7.5C8 6.67 7.33 6 6.5 6C5.67 6 5 6.67 5 7.5C5 8.33 5.67 9 6.5 9ZM17.5 9C18.33 9 19 8.33 19 7.5C19 6.67 18.33 6 17.5 6C16.67 6 16 6.67 16 7.5C16 8.33 16.67 9 17.5 9ZM12 17.5C9.51 17.5 7.5 15.49 7.5 13H16.5C16.5 15.49 14.49 17.5 12 17.5Z" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.1 21.28 8.9L19.36 5.55C19.25 5.35 19.04 5.25 18.82 5.27L16.34 5.65C15.87 5.29 15.35 4.98 14.79 4.74L14.36 2.23C14.32 2.01 14.13 1.85 13.91 1.85H10.09C9.87 1.85 9.68 2.01 9.64 2.23L9.21 4.74C8.65 4.98 8.13 5.29 7.66 5.65L5.18 5.27C4.96 5.25 4.75 5.35 4.64 5.55L2.72 8.9C2.61 9.1 2.66 9.34 2.84 9.48L4.87 11.06C4.82 11.36 4.8 11.68 4.8 12C4.8 12.32 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.9 2.72 15.1L4.64 18.45C4.75 18.65 4.96 18.75 5.18 18.73L7.66 18.35C8.13 18.71 8.65 19.02 9.21 19.26L9.64 21.77C9.68 21.99 9.87 22.15 10.09 22.15H13.91C14.13 22.15 14.32 21.99 14.36 21.77L14.79 19.26C15.35 19.02 15.87 18.71 16.34 18.35L18.82 18.73C19.04 18.75 19.25 18.65 19.36 18.45L21.28 15.1C21.39 14.9 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.2 15.6 8.6 14 8.6 12.2C8.6 10.4 10.2 8.8 12 8.8C13.8 8.8 15.4 10.4 15.4 12.2C15.4 14 13.8 15.6 12 15.6Z" />
    </svg>
  ),
};

// Block Editor Component
const BlockEditor = ({ block, onUpdate, lang = 'en' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(block.content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
    ],
    content: localContent.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setLocalContent((prev) => ({ ...prev, content: html }));
      onUpdate(block.id, { content: html });
    },
  });

  const blockDef = getBlockDefinition(block.type);

  const renderBlockSettings = () => {
    switch (block.type) {
      case BLOCK_TYPES.HERO:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title ({lang === 'en' ? 'English' : 'Arabic'})
              </label>
              <input
                type="text"
                value={localContent.title || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, title: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { title: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter hero title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={localContent.subtitle || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, subtitle: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { subtitle: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Image URL
              </label>
              <input
                type="text"
                value={localContent.background_image || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, background_image: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { background_image: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter image URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Text
              </label>
              <input
                type="text"
                value={localContent.cta_text || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, cta_text: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { cta_text: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Button text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Link
              </label>
              <input
                type="text"
                value={localContent.cta_link || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, cta_link: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { cta_link: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Button link"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alignment
              </label>
              <select
                value={localContent.alignment || 'center'}
                onChange={(e) => {
                  const newContent = { ...localContent, alignment: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { alignment: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        );

      case BLOCK_TYPES.IMAGE:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={localContent.image || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, image: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { image: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter image URL"
              />
            </div>
            {localContent.image && (
              <div className="mt-2">
                <img
                  src={localContent.image}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <input
                type="text"
                value={localContent.caption || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, caption: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { caption: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Image caption"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={localContent.alt_text || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, alt_text: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { alt_text: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alt text for accessibility"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alignment
              </label>
              <select
                value={localContent.alignment || 'center'}
                onChange={(e) => {
                  const newContent = { ...localContent, alignment: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { alignment: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width
              </label>
              <select
                value={localContent.width || 'full'}
                onChange={(e) => {
                  const newContent = { ...localContent, width: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { width: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full">Full Width</option>
                <option value="large">Large</option>
                <option value="medium">Medium</option>
                <option value="small">Small</option>
              </select>
            </div>
          </div>
        );

      case BLOCK_TYPES.CTA:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={localContent.title || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, title: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { title: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CTA title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={localContent.description || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, description: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { description: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="CTA description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={localContent.button_text || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, button_text: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { button_text: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Button text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Link
              </label>
              <input
                type="text"
                value={localContent.button_link || ''}
                onChange={(e) => {
                  const newContent = { ...localContent, button_link: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { button_link: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Button link"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={localContent.background_color || '#f0f0f0'}
                onChange={(e) => {
                  const newContent = { ...localContent, background_color: e.target.value };
                  setLocalContent(newContent);
                  onUpdate(block.id, { background_color: e.target.value });
                }}
                className="w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        );

      case BLOCK_TYPES.TEXT:
      default:
        return (
          <div className="space-y-4">
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-300 px-4 py-2 flex gap-2 flex-wrap">
                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`px-3 py-1 rounded ${
                    editor?.isActive('bold')
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  Bold
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`px-3 py-1 rounded ${
                    editor?.isActive('italic')
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  Italic
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={`px-3 py-1 rounded ${
                    editor?.isActive('underline')
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  Underline
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`px-3 py-1 rounded ${
                    editor?.isActive('heading', { level: 1 })
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  H1
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`px-3 py-1 rounded ${
                    editor?.isActive('heading', { level: 2 })
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  H2
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`px-3 py-1 rounded ${
                    editor?.isActive('heading', { level: 3 })
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  H3
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={`px-3 py-1 rounded ${
                    editor?.isActive('bulletList')
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  Bullet List
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={`px-3 py-1 rounded ${
                    editor?.isActive('orderedList')
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  Numbered List
                </button>
                <button
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  className={`px-3 py-1 rounded ${
                    editor?.isActive({ textAlign: 'left' })
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  Left
                </button>
                <button
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  className={`px-3 py-1 rounded ${
                    editor?.isActive({ textAlign: 'center' })
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  Center
                </button>
                <button
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  className={`px-3 py-1 rounded ${
                    editor?.isActive({ textAlign: 'right' })
                      ? 'bg-blue-500 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  Right
                </button>
              </div>
              <EditorContent editor={editor} className="p-4 min-h-[200px]" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 cursor-move">{Icons.drag}</span>
          <h3 className="font-medium text-gray-900">
            {blockDef?.label || block.type} - {lang === 'en' ? 'English' : 'Arabic'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit"
          >
            {Icons.edit}
          </button>
          <button
            onClick={() => onUpdate(block.id, null, 'duplicate')}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="Duplicate"
          >
            {Icons.copy}
          </button>
          <button
            onClick={() => onUpdate(block.id, null, 'moveUp')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
            title="Move Up"
          >
            {Icons.moveUp}
          </button>
          <button
            onClick={() => onUpdate(block.id, null, 'moveDown')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
            title="Move Down"
          >
            {Icons.moveDown}
          </button>
          <button
            onClick={() => onUpdate(block.id, null, 'delete')}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete"
          >
            {Icons.delete}
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Block Settings</h4>
          {renderBlockSettings()}
        </div>
      )}

      {/* Preview of block content */}
      {!isEditing && block.type === BLOCK_TYPES.TEXT && (
        <div
          className="prose prose-sm max-w-none mt-2 p-3 bg-gray-50 rounded-md"
          dangerouslySetInnerHTML={{ __html: localContent.content || '<p>No content yet</p>' }}
        />
      )}
    </div>
  );
};

// Main Page Builder Component
const Builder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPreviewUrl } = useSite();

  // State
  const [blocksEn, setBlocksEn] = useState([]);
  const [blocksAr, setBlocksAr] = useState([]);
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Get current blocks based on language
  const currentBlocks = lang === 'en' ? blocksEn : blocksAr;
  const setCurrentBlocks = lang === 'en' ? setBlocksEn : setBlocksAr;

  // Load page data
  useEffect(() => {
    if (id) {
      loadPage(id);
    }
  }, [id]);

  const loadPage = async (pageId) => {
    try {
      setLoading(true);
      setError(null);
      
      // pagesApi.getOne() returns Axios response; unwrap JsonResource layer
      const res = await pagesApi.getOne(pageId);
      const pageData = res.data.data || res.data;
      
      setPageData(pageData);
      
      // Load blocks from page data
      if (pageData.blocks_en) {
        setBlocksEn(Array.isArray(pageData.blocks_en) ? pageData.blocks_en : JSON.parse(pageData.blocks_en || '[]'));
      }
      if (pageData.blocks_ar) {
        setBlocksAr(Array.isArray(pageData.blocks_ar) ? pageData.blocks_ar : JSON.parse(pageData.blocks_ar || '[]'));
      }
      
      // Generate preview URL
      if (pageData.site?.domain && pageData.slug) {
        setPreviewUrl(getPreviewUrl(pageData.site.domain, pageData.slug));
      }
    } catch (err) {
      console.error('Error loading page:', err);
      setError(err.message || 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  // Handle block update
  const handleBlockUpdate = useCallback(
    (blockId, content, action = 'update') => {
      switch (action) {
        case 'delete':
          setCurrentBlocks((prev) => blockHelpers.removeBlock(prev, blockId));
          break;
        case 'duplicate':
          setCurrentBlocks((prev) => blockHelpers.duplicateBlock(prev, blockId));
          break;
        case 'moveUp':
          setCurrentBlocks((prev) => blockHelpers.moveBlockUp(prev, blockId));
          break;
        case 'moveDown':
          setCurrentBlocks((prev) => blockHelpers.moveBlockDown(prev, blockId));
          break;
        case 'update':
        default:
          if (content) {
            setCurrentBlocks((prev) =>
              blockHelpers.updateBlock(prev, blockId, content)
            );
          }
          break;
      }
    },
    [setCurrentBlocks]
  );

  // Handle block reorder
  const handleReorder = useCallback(
    (reorderedBlocks) => {
      setCurrentBlocks(reorderedBlocks);
    },
    [setCurrentBlocks]
  );

  // Add new block
  const handleAddBlock = (blockType) => {
    const newBlock = createBlock(blockType);
    if (newBlock) {
      setCurrentBlocks((prev) => [...prev, newBlock].map((block, index) => ({
        ...block,
        order: index,
      })));
    }
    setShowBlockSelector(false);
  };

  // Save page
  const handleSave = async () => {
    if (!pageData) return;

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        blocks_en: blocksEn,
        blocks_ar: blocksAr,
      };

      await pagesApi.update(pageData.id, updateData);
      
      // Reload page data
      await loadPage(pageData.id);
      
      alert('Page saved successfully!');
    } catch (err) {
      console.error('Error saving page:', err);
      setError(err.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  // Preview page
  const handlePreview = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  // Block type selector component
  const BlockTypeSelector = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Block</h2>
          <button
            onClick={() => setShowBlockSelector(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            {Icons.close}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.values(BLOCK_DEFINITIONS).map((blockDef) => (
            <button
              key={blockDef.type}
              onClick={() => handleAddBlock(blockDef.type)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{blockDef.icon}</span>
                <span className="font-medium">{blockDef.label}</span>
              </div>
              <p className="text-sm text-gray-600">{blockDef.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Page Builder
              {pageData && (
                <span className="text-lg font-normal text-gray-600 ml-2">
                  - {pageData.title || 'Untitled Page'}
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  lang === 'en'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('ar')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  lang === 'ar'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                العربية
              </button>
            </div>

            {/* Preview Button */}
            {previewUrl && (
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
              >
                {Icons.preview}
                Preview
              </button>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Icons.save}
              {saving ? 'Saving...' : 'Save'}
            </button>

            {/* Back Button */}
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Add Block Button */}
          <button
            onClick={() => setShowBlockSelector(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 mb-6"
          >
            {Icons.add}
            Add Block ({lang === 'en' ? 'English' : 'Arabic'})
          </button>

          {/* Blocks List */}
          {currentBlocks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500 text-lg mb-4">No blocks yet</p>
              <p className="text-gray-400">
                Click "Add Block" above to start building your page
              </p>
            </div>
          ) : (
            <DndContextWrapper
              items={currentBlocks}
              onReorder={handleReorder}
              renderOverlay={(activeItem) => (
                <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg opacity-90">
                  <h3 className="font-medium">
                    {getBlockDefinition(activeItem.type)?.label || activeItem.type}
                  </h3>
                </div>
              )}
            >
              <div className="space-y-4">
                {currentBlocks.map((block) => (
                  <SortableItemWrapper key={block.id} id={block.id}>
                    <BlockEditor
                      block={block}
                      onUpdate={handleBlockUpdate}
                      lang={lang}
                    />
                  </SortableItemWrapper>
                ))}
              </div>
            </DndContextWrapper>
          )}
        </div>
      </div>

      {/* Block Type Selector Modal */}
      {showBlockSelector && <BlockTypeSelector />}
    </div>
  );
};

export default Builder;
