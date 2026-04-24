import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateInfluencer } from '@/hooks/useDashboard';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddInfluencerModal({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [niche, setNiche] = useState('');
  const [brandColor, setBrandColor] = useState('#6366f1');
  const createInfluencer = useCreateInfluencer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createInfluencer.mutateAsync({
        name: name.trim(),
        handle: handle.trim() || null,
        niche: niche.trim() || null,
        brand_color: brandColor,
      });
      toast.success('Influencer added!');
      setName('');
      setHandle('');
      setNiche('');
      setBrandColor('#6366f1');
      onClose();
    } catch {
      toast.error('Failed to add influencer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Influencer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inf-name">Name *</Label>
            <Input
              id="inf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah Johnson"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inf-handle">Handle</Label>
            <Input
              id="inf-handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@sarah"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inf-niche">Niche</Label>
            <Input
              id="inf-niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Fitness & Wellness"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inf-color">Brand Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="inf-color"
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-border bg-transparent p-0.5"
              />
              <Input
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                placeholder="#6366f1"
                className="w-28 font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createInfluencer.isPending}>
              {createInfluencer.isPending ? 'Adding...' : 'Add Influencer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
