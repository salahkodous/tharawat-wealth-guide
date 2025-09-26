import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const GoogleSearchTest = () => {
  const [query, setQuery] = useState('EFG Hermes Egypt stock analysis');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testGoogleSearch = async () => {
    setTesting(true);
    setResults(null);
    
    try {
      console.log('Testing Google Search API...');
      
      const { data, error } = await supabase.functions.invoke('test-google-search', {
        body: { query }
      });

      if (error) {
        console.error('Function error:', error);
        toast.error('Test failed: ' + error.message);
        setResults({ success: false, error: error.message, test_status: 'ERROR' });
        return;
      }

      console.log('Test results:', data);
      setResults(data);
      
      if (data.success) {
        toast.success('Google Search API is working!');
      } else {
        toast.error('Google Search API test failed');
      }
    } catch (err) {
      console.error('Test error:', err);
      toast.error('Test error: ' + (err as Error).message);
      setResults({ success: false, error: (err as Error).message, test_status: 'ERROR' });
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'bg-green-500';
      case 'FAILED': return 'bg-red-500';
      case 'ERROR': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Google Search API Test
          {results && (
            <Badge className={getStatusColor(results.test_status)}>
              {results.test_status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search query..."
            className="flex-1"
          />
          <Button 
            onClick={testGoogleSearch} 
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test Search'}
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Test Results</h3>
              <p className="text-sm">
                <strong>Status:</strong> {results.test_status}
              </p>
              <p className="text-sm">
                <strong>Query:</strong> {results.query}
              </p>
              {results.success && (
                <p className="text-sm">
                  <strong>Results Found:</strong> {results.results_count}
                </p>
              )}
              <p className="text-sm mt-2">
                <strong>Message:</strong> {results.message}
              </p>
              {results.error && (
                <p className="text-sm text-red-600">
                  <strong>Error:</strong> {results.error}
                </p>
              )}
              {results.last_error && (
                <p className="text-sm text-red-600">
                  <strong>Last Error:</strong> {results.last_error}
                </p>
              )}
            </div>

            {results.success && results.results && (
              <div className="space-y-2">
                <h4 className="font-semibold">Search Results:</h4>
                {results.results.map((result: any, index: number) => (
                  <div key={index} className="p-3 bg-card border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">{result.title}</h5>
                    <p className="text-xs text-muted-foreground mb-2">{result.snippet}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-primary">{result.source}</span>
                      <a 
                        href={result.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};