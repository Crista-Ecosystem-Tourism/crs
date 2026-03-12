import { useState } from 'react'
import { Map } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'

export function SaveRouteModal() {
  const { activeModal, closeModal, saveCurrentRoute, places } = useApp()
  const isOpen = activeModal === 'save-route'
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedPlaces = places.filter(p => p.selected)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await saveCurrentRoute(name.trim())
      setName('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Сохранить маршрут
          </DialogTitle>
          <DialogDescription>
            {selectedPlaces.length} мест будет сохранено в маршрут
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Input
            placeholder="Название маршрута"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />

          {selectedPlaces.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {selectedPlaces.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm text-text-secondary px-2 py-1 rounded bg-surface-light">
                  <span className="text-xs">📍</span>
                  <span className="truncate">{p.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={closeModal}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || saving || selectedPlaces.length === 0}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
