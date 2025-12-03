import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TranslationService } from '@/background/utils/translate'
import TranslationServiceCard from './TranslationServiceCard'

interface SortableServiceCardProps {
  service: TranslationService
  onToggle: (id: string, enabled: boolean) => void
  onEdit: (service: TranslationService) => void
  onDelete?: (id: string) => void
  onTest: (service: TranslationService) => void
}
/**
 * 可拖拽的翻译服务卡片
 * @param props 
 * @returns 
 */
export default function SortableServiceCard(props: SortableServiceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.service.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TranslationServiceCard 
        {...props} 
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

