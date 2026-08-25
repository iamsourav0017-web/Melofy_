import React, { useState, useEffect, useRef } from 'react';
import { Check, Edit2 } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  isEditingGlobal?: boolean;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  isEditingGlobal = false,
  className = '',
  as: Component = 'span',
  multiline = false,
  style,
  id
}) => {
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (isLocalEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLocalEditing]);

  const handleCommit = () => {
    setIsLocalEditing(false);
    if (draft !== value) {
      onSave(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      setDraft(value);
      setIsLocalEditing(false);
    }
  };

  if (isEditingGlobal && isLocalEditing) {
    if (multiline) {
      return (
        <div className="relative inline-block w-full my-1 z-30">
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            className={`w-full p-2.5 rounded-lg bg-white/95 text-[#171A1C] border-2 border-[#15BCDF] shadow-lg outline-none font-inherit text-inherit ${className}`}
            rows={3}
          />
          <button
            type="button"
            onClick={handleCommit}
            className="absolute right-2 bottom-2 p-1.5 rounded bg-[#15BCDF] text-[#171A1C] hover:bg-[#3FD0EF] cursor-pointer"
            title="Save changes (Blur / Esc)"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <span className="relative inline-flex items-center my-0.5 z-30">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          className={`px-2 py-1 rounded bg-white/95 text-[#171A1C] border-2 border-[#15BCDF] shadow-md outline-none font-inherit text-inherit ${className}`}
        />
        <button
          type="button"
          onClick={handleCommit}
          className="ml-1 p-1 rounded bg-[#15BCDF] text-[#171A1C] hover:bg-[#3FD0EF] cursor-pointer"
        >
          <Check className="w-3 h-3" />
        </button>
      </span>
    );
  }

  if (isEditingGlobal) {
    return (
      <Component
        id={id}
        style={style}
        onClick={() => setIsLocalEditing(true)}
        className={`group relative cursor-pointer outline-dashed outline-1 outline-[#15BCDF]/50 hover:outline-2 hover:outline-[#15BCDF] hover:bg-[#15BCDF]/10 rounded px-1 transition-all ${className}`}
        title="Click to edit text directly"
      >
        {value}
        <span className="inline-block ml-1.5 opacity-0 group-hover:opacity-100 text-[#15BCDF] text-xs transition-opacity align-middle">
          <Edit2 className="w-3 h-3 inline" />
        </span>
      </Component>
    );
  }

  return (
    <Component id={id} style={style} className={className}>
      {value}
    </Component>
  );
};
