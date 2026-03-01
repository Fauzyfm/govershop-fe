"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
} from "lucide-react";

interface SimpleRichEditorProps {
    value: string;
    onChange: (html: string) => void;
    maxLength?: number;
    placeholder?: string;
    className?: string;
}

export default function SimpleRichEditor({
    value,
    onChange,
    maxLength,
    placeholder = "Tulis deskripsi...",
    className = "",
}: SimpleRichEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [charCount, setCharCount] = useState(0);
    const isInitRef = useRef(false);

    // Set initial content
    useEffect(() => {
        if (editorRef.current && !isInitRef.current) {
            editorRef.current.innerHTML = value;
            setCharCount(editorRef.current.innerText.length);
            isInitRef.current = true;
        }
    }, [value]);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const handleInput = useCallback(() => {
        if (!editorRef.current) return;

        const text = editorRef.current.innerText;
        const html = editorRef.current.innerHTML;

        if (maxLength && text.length > maxLength) {
            // Truncate text content to maxLength
            return;
        }

        setCharCount(text.length);
        onChange(html);
    }, [onChange, maxLength]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");

        if (maxLength && editorRef.current) {
            const currentLen = editorRef.current.innerText.length;
            const remaining = maxLength - currentLen;
            if (remaining <= 0) return;
            document.execCommand("insertText", false, text.slice(0, remaining));
        } else {
            document.execCommand("insertText", false, text);
        }

        handleInput();
    }, [maxLength, handleInput]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (maxLength && editorRef.current) {
            const text = editorRef.current.innerText;
            // Allow control keys
            if (text.length >= maxLength && !e.ctrlKey && !e.metaKey && e.key.length === 1 && !["Backspace", "Delete"].includes(e.key)) {
                e.preventDefault();
            }
        }
    }, [maxLength]);

    const toolbarButtons = [
        { icon: Bold, command: "bold", title: "Bold" },
        { icon: Italic, command: "italic", title: "Italic" },
        { icon: Underline, command: "underline", title: "Underline" },
        { type: "divider" as const },
        { icon: AlignLeft, command: "justifyLeft", title: "Rata Kiri" },
        { icon: AlignCenter, command: "justifyCenter", title: "Rata Tengah" },
        { icon: AlignRight, command: "justifyRight", title: "Rata Kanan" },
        { type: "divider" as const },
        { icon: List, command: "insertUnorderedList", title: "Bullet List" },
        { icon: ListOrdered, command: "insertOrderedList", title: "Numbered List" },
    ];

    return (
        <div className={`border border-white/10 rounded-xl overflow-hidden bg-black/40 ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/10 bg-white/5 flex-wrap">
                {toolbarButtons.map((btn, idx) => {
                    if ("type" in btn && btn.type === "divider") {
                        return <div key={idx} className="w-px h-5 bg-white/10 mx-1" />;
                    }
                    const Icon = btn.icon!;
                    return (
                        <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent losing focus
                                execCommand(btn.command!);
                            }}
                            className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                            title={btn.title}
                        >
                            <Icon className="w-3.5 h-3.5" />
                        </button>
                    );
                })}
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                className="min-h-[120px] max-h-[400px] overflow-y-auto px-4 py-3 text-sm text-white focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-white/20 prose prose-invert prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 resize-y"
                data-placeholder={placeholder}
            />

            {/* Character Counter */}
            {maxLength && (
                <div className="px-4 py-1.5 border-t border-white/5 text-right">
                    <span className={`text-xs ${charCount > maxLength * 0.9 ? "text-amber-400" : "text-white/30"}`}>
                        {charCount}/{maxLength} karakter
                    </span>
                </div>
            )}
        </div>
    );
}
