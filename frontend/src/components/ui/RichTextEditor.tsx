/**
 * Rich Text Editor Component - Notion-style block-based editor
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Plus,
  GripVertical,
  Trash2,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Block {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'quote' | 'code' | 'todo';
  content: string;
  completed?: boolean; // For todo blocks
  level?: number; // For list indentation
}

interface RichTextEditorProps {
  initialContent?: Block[];
  onChange?: (blocks: Block[]) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = [],
  onChange,
  placeholder = "Start typing...",
  className,
  readOnly = false
}) => {
  const [blocks, setBlocks] = useState<Block[]>(
    initialContent.length > 0 ? initialContent : [
      { id: generateId(), type: 'paragraph', content: '' }
    ]
  );
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);

  // Generate unique ID for blocks
  function generateId(): string {
    return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Update blocks and notify parent
  const updateBlocks = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    onChange?.(newBlocks);
  }, [onChange]);

  // Update specific block
  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    updateBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  }, [blocks, updateBlocks]);

  // Add new block
  const addBlock = useCallback((afterBlockId: string, type: Block['type'] = 'paragraph') => {
    const afterIndex = blocks.findIndex(b => b.id === afterBlockId);
    const newBlock: Block = {
      id: generateId(),
      type,
      content: ''
    };
    
    const newBlocks = [...blocks];
    newBlocks.splice(afterIndex + 1, 0, newBlock);
    updateBlocks(newBlocks);
    
    // Focus the new block
    setTimeout(() => {
      const element = document.querySelector(`[data-block-id="${newBlock.id}"] textarea, [data-block-id="${newBlock.id}"] input`);
      if (element) (element as HTMLElement).focus();
    }, 0);
  }, [blocks, updateBlocks]);

  // Delete block
  const deleteBlock = useCallback((blockId: string) => {
    if (blocks.length === 1) {
      // Don't delete the last block, just clear it
      updateBlock(blockId, { content: '' });
      return;
    }
    
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    const newBlocks = blocks.filter(b => b.id !== blockId);
    updateBlocks(newBlocks);
    
    // Focus previous block if available
    if (blockIndex > 0) {
      const prevBlock = newBlocks[blockIndex - 1];
      setTimeout(() => {
        const element = document.querySelector(`[data-block-id="${prevBlock.id}"] textarea, [data-block-id="${prevBlock.id}"] input`);
        if (element) (element as HTMLElement).focus();
      }, 0);
    }
  }, [blocks, updateBlocks, updateBlock]);

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string) => {
    if (readOnly) return;

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock(blockId);
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      deleteBlock(blockId);
    } else if (e.key === '/' && block.content === '') {
      e.preventDefault();
      setShowBlockMenu(blockId);
    }
  }, [blocks, addBlock, deleteBlock, readOnly]);

  // Block type menu options
  const blockTypes = [
    { type: 'paragraph' as const, label: 'Text', icon: null },
    { type: 'heading1' as const, label: 'Heading 1', icon: Heading1 },
    { type: 'heading2' as const, label: 'Heading 2', icon: Heading2 },
    { type: 'heading3' as const, label: 'Heading 3', icon: Heading3 },
    { type: 'bulletList' as const, label: 'Bullet List', icon: List },
    { type: 'numberedList' as const, label: 'Numbered List', icon: ListOrdered },
    { type: 'todo' as const, label: 'To-do List', icon: CheckSquare },
    { type: 'quote' as const, label: 'Quote', icon: Quote },
    { type: 'code' as const, label: 'Code', icon: Code },
  ];

  // Render block based on type
  const renderBlock = (block: Block) => {
    const commonProps = {
      value: block.content,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        updateBlock(block.id, { content: e.target.value }),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block.id),
      onFocus: () => setFocusedBlockId(block.id),
      onBlur: () => setFocusedBlockId(null),
      placeholder: block.content === '' ? placeholder : '',
      readOnly,
      className: "w-full bg-transparent border-none outline-none resize-none"
    };

    switch (block.type) {
      case 'heading1':
        return (
          <input
            {...commonProps}
            className={cn(commonProps.className, "text-3xl font-bold")}
          />
        );
      case 'heading2':
        return (
          <input
            {...commonProps}
            className={cn(commonProps.className, "text-2xl font-semibold")}
          />
        );
      case 'heading3':
        return (
          <input
            {...commonProps}
            className={cn(commonProps.className, "text-xl font-medium")}
          />
        );
      case 'quote':
        return (
          <textarea
            {...commonProps}
            rows={1}
            className={cn(commonProps.className, "italic text-gray-600 border-l-4 border-gray-300 pl-4")}
          />
        );
      case 'code':
        return (
          <textarea
            {...commonProps}
            rows={1}
            className={cn(commonProps.className, "font-mono bg-gray-100 p-2 rounded text-sm")}
          />
        );
      case 'bulletList':
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">•</span>
            <textarea
              {...commonProps}
              rows={1}
              className={cn(commonProps.className, "flex-1")}
            />
          </div>
        );
      case 'numberedList':
        const listIndex = blocks.filter((b, i) => 
          i <= blocks.findIndex(b2 => b2.id === block.id) && b.type === 'numberedList'
        ).length;
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-1">{listIndex}.</span>
            <textarea
              {...commonProps}
              rows={1}
              className={cn(commonProps.className, "flex-1")}
            />
          </div>
        );
      case 'todo':
        return (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={block.completed || false}
              onChange={(e) => updateBlock(block.id, { completed: e.target.checked })}
              className="mt-1"
              disabled={readOnly}
            />
            <textarea
              {...commonProps}
              rows={1}
              className={cn(
                commonProps.className, 
                "flex-1",
                block.completed ? "line-through text-gray-500" : ""
              )}
            />
          </div>
        );
      default:
        return (
          <textarea
            {...commonProps}
            rows={1}
            className={cn(commonProps.className, "min-h-[24px]")}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {blocks.map((block, index) => (
        <div
          key={block.id}
          data-block-id={block.id}
          className={cn(
            "group relative",
            focusedBlockId === block.id ? "ring-1 ring-blue-200 rounded" : ""
          )}
        >
          {/* Block controls */}
          {!readOnly && (
            <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => setShowBlockMenu(showBlockMenu === block.id ? null : block.id)}
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 cursor-grab"
              >
                <GripVertical className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Block content */}
          <div className="min-h-[32px] flex items-start">
            {renderBlock(block)}
          </div>

          {/* Block type menu */}
          {showBlockMenu === block.id && (
            <div className="absolute top-8 left-0 bg-white border rounded-lg shadow-lg p-2 z-10 min-w-48">
              {blockTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => {
                    updateBlock(block.id, { type: type.type });
                    setShowBlockMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-sm"
                >
                  {type.icon && <type.icon className="w-4 h-4" />}
                  {type.label}
                </button>
              ))}
            </div>
          )}

          {/* Delete button */}
          {!readOnly && blocks.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-8 top-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteBlock(block.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      ))}

      {/* Click outside to close menu */}
      {showBlockMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowBlockMenu(null)}
        />
      )}
    </div>
  );
};

export default RichTextEditor;