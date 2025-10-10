import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, TrendingUp, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  platform: string;
  campaign_type: string;
  status: string;
  budget: number | null;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  start_date: string | null;
  end_date: string | null;
}

interface CampaignManagerProps {
  projectId: string;
}

const CampaignManager = ({ projectId }: CampaignManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    platform: 'facebook',
    campaign_type: 'awareness',
    budget: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchCampaigns();
  }, [projectId]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name.trim()) {
      toast({
        title: 'Error',
        description: 'Campaign name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([
          {
            project_id: projectId,
            user_id: user?.id,
            name: newCampaign.name,
            platform: newCampaign.platform,
            campaign_type: newCampaign.campaign_type,
            budget: newCampaign.budget ? parseFloat(newCampaign.budget) : null,
            start_date: newCampaign.start_date || null,
            end_date: newCampaign.end_date || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCampaigns([data, ...campaigns]);
      setNewCampaign({
        name: '',
        platform: 'facebook',
        campaign_type: 'awareness',
        budget: '',
        start_date: '',
        end_date: '',
      });
      setIsDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'Campaign created successfully',
      });
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Campaigns
            </CardTitle>
            <CardDescription>Manage your marketing campaigns</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new marketing campaign for your project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Summer Sale 2025"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={newCampaign.platform}
                      onValueChange={(value) => setNewCampaign({ ...newCampaign, platform: value })}
                    >
                      <SelectTrigger id="platform">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="campaign-type">Campaign Type</Label>
                    <Select
                      value={newCampaign.campaign_type}
                      onValueChange={(value) => setNewCampaign({ ...newCampaign, campaign_type: value })}
                    >
                      <SelectTrigger id="campaign-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Awareness</SelectItem>
                        <SelectItem value="traffic">Traffic</SelectItem>
                        <SelectItem value="conversion">Conversion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Budget (USD)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="1000"
                      value={newCampaign.budget}
                      onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newCampaign.start_date}
                      onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newCampaign.end_date}
                      onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateCampaign}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No campaigns yet. Create your first campaign to start marketing.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{campaign.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {campaign.platform}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {campaign.campaign_type}
                        </Badge>
                        <Badge variant={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="text-lg font-semibold">
                        {campaign.budget ? formatCurrency(campaign.budget) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spent</p>
                      <p className="text-lg font-semibold">{formatCurrency(campaign.spent)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="text-lg font-semibold">
                        {campaign.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="text-lg font-semibold">
                        {campaign.clicks.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {(campaign.start_date || campaign.end_date) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {campaign.start_date && <span>Start: {campaign.start_date}</span>}
                      {campaign.end_date && <span>End: {campaign.end_date}</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignManager;
