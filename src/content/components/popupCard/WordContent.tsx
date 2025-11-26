import { WordPopupPayload } from "@/types";
import { Volume2 } from "lucide-react";

export default function WordContent({ payload }: { payload: WordPopupPayload }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap">
        <p className="text-2xl font-semibold leading-tight text-gray-900 dark:text-gray-100">
          {payload.original}
        </p>

        <div className="flex items-center gap-2">
          {payload.phonetic && (
            <>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                /{payload.phonetic}/
              </div>
              <button className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 cursor-pointer transition-all duration-200">
                <Volume2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div>{payload.text}</div>

      {/* 显示词性和释义 */}
      {payload.definitions && payload.definitions.length > 0 && (
        <div className="space-y-1 text-sm">
          {payload.definitions.map((def, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-medium shrink-0">
                {def.partOfSpeech}
              </span>
              <span className="text-gray-700 dark:text-gray-300">
                {def.meanings.slice(0, 3).join('；')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
