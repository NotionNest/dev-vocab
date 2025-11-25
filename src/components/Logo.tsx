import { FolderCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Logo() {
  const navigate = useNavigate()

  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => navigate('/')}
    >
      <div className="text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900 rounded-md p-1">
        <FolderCode size={18} />
      </div>
      <h1 className="text-lg font-semibold cursor-pointer text-gray-900 dark:text-white">DevVocab</h1>
    </div>
  )
}
