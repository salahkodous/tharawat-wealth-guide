import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import OptimizedCurrencyValue from '@/components/OptimizedCurrencyValue';
import { useTranslation } from '@/hooks/useTranslation';

interface EditableFinanceCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onUpdate: (value: number) => void;
}

const EditableFinanceCard: React.FC<EditableFinanceCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSave = () => {
    const numValue = parseFloat(inputValue) || 0;
    onUpdate(numValue);
    setIsOpen(false);
  };

  const handleOpen = () => {
    setInputValue(value.toString());
    setIsOpen(true);
  };

  return (
    <>
      <Card 
        className="glass-card cursor-pointer hover:shadow-lg transition-shadow" 
        onClick={handleOpen}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">{label}</div>
              <div className="text-2xl font-bold">
                <OptimizedCurrencyValue amount={value} />
              </div>
            </div>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('edit')} {label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">{t('amount')}</Label>
              <Input
                id="amount"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('enterAmount')}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {t('save')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableFinanceCard;