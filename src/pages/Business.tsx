import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BusinessProjectManager from '@/components/BusinessProjectManager';
import ShopifyIntegration from '@/components/ShopifyIntegration';
import MetaIntegration from '@/components/MetaIntegration';
import CampaignManager from '@/components/CampaignManager';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Business = () => {
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Anakin Business</h1>
          <p className="text-muted-foreground">
            Manage your e-commerce projects and marketing campaigns in one place
          </p>
        </div>

        <div className="grid gap-6">
          {/* Project Selection */}
          <BusinessProjectManager 
            onProjectSelect={setSelectedProjectId}
            selectedProjectId={selectedProjectId}
          />

          {selectedProjectId && (
            <Tabs defaultValue="integrations" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              </TabsList>

              <TabsContent value="integrations" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <ShopifyIntegration projectId={selectedProjectId} />
                  <MetaIntegration projectId={selectedProjectId} />
                </div>
              </TabsContent>

              <TabsContent value="campaigns">
                <CampaignManager projectId={selectedProjectId} />
              </TabsContent>
            </Tabs>
          )}

          {!selectedProjectId && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  Create or select a project to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Business;
