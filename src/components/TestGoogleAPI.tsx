import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const TestGoogleAPI = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testAPI = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      console.log('Testing Google Search API...');
      
      const { data, error } = await supabase.functions.invoke('test-google-search', {
        body: { query: "EFG Hermes Egypt financial analysis" }
      });

      console.log('Test response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        setResult({ success: false, error: JSON.stringify(error), type: 'function_error' });
        toast.error('Function call failed');
        return;
      }

      setResult(data);
      
      if (data?.success) {
        toast.success('Google Search API working!');
      } else {
        toast.error('Google Search API failed');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setResult({ success: false, error: (err as Error).message, type: 'unexpected_error' });
      toast.error('Unexpected error occurred');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>🔧 Quick Google API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testAPI} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testing...' : 'Test Google Search API'}
        </Button>

        {result && (
          <div className="p-4 bg-muted rounded-lg">
            <pre className="text-xs overflow-auto max-h-64">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};