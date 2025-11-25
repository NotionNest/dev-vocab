import React, { useState } from 'react'
import { X, Brain } from 'lucide-react'
// import { WordEntry } from '../types';

export enum WordStatus {
  NEW = 'NEW',
  REVIEWING = 'REVIEWING',
  MASTERED = 'MASTERED',
}

export interface WordEntry {
  id: string
  word: string
  phonetic: string
  translation: string
  partOfSpeech: string
  context: string
  source: string
  status: WordStatus
  nextReview: number // timestamp
  interval: number // Current interval in days (for Ebbinghaus)
  createdAt: number
  seenCount: number
}

interface ReviewModalProps {
  entry: WordEntry
  onClose: () => void
  onReview: (id: string, remembered: boolean) => void
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  entry,
  onClose,
  onReview,
}) => {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="fixed z-50 w-[320px] bg-base border border-input border-t-accent-yellow rounded-xl shadow-modal overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-accent-yellow/10 border-b border-surface/30">
        <div className="flex items-center gap-2 text-accent-yellow">
          <Brain size={14} />
          <span className="text-xs font-medium">Review Mode</span>
        </div>
        <button onClick={onClose} className="text-muted hover:text-primary">
          <X size={16} />
        </button>
      </div>

      <div className="p-4">
        <h2 className="font-mono font-bold text-2xl text-primary mb-4 text-center">
          {entry.word}
        </h2>

        {/* Masked Area */}
        <div
          className="relative bg-surface rounded-md p-4 mb-4 cursor-pointer group min-h-[80px] flex items-center justify-center text-center"
          onClick={() => setRevealed(true)}
        >
          {!revealed ? (
            <>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10 rounded-md"></div>
              <span className="text-sm text-muted group-hover:text-primary transition-colors z-10">
                Click to reveal meaning
              </span>
            </>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="text-xs text-accent-blue mb-1 font-mono">
                {entry.partOfSpeech}
              </div>
              <p className="text-primary text-sm">{entry.translation}</p>
            </div>
          )}
        </div>

        {/* Decision Buttons */}
        {revealed && (
          <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={() => onReview(entry.id, false)}
              className="h-9 rounded-md border border-accent-red text-accent-red text-sm font-medium hover:bg-accent-red/10 transition-colors"
            >
              Forgot
            </button>
            <button
              onClick={() => onReview(entry.id, true)}
              className="h-9 rounded-md bg-accent-green text-base text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Remember
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
