'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ChatSession } from '@/types/chat';
import { useChatStore } from '@/lib/store';

interface RenameChatDialogProps {
  session: ChatSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RenameChatDialog({ session, isOpen, onClose }: RenameChatDialogProps) {
  const [title, setTitle] = useState('');
  const { updateSessionTitle } = useChatStore();

  useEffect(() => {
    if (isOpen && session) {
      setTitle(session.title);
    }
  }, [isOpen, session]);

  const handleSave = () => {
    if (title.trim() && session) {
      updateSessionTitle(session.id, title.trim());
      onClose();
    }
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sohbeti Yeniden Adlandır</DialogTitle>
          <DialogDescription>
            Sohbetiniz için yeni bir başlık girin.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            id="name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
          }}
            className="col-span-3"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={handleSave}>Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
