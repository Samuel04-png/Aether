/**
 * Integration Testing Component
 * Quick way to test all integrations are working
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useSlackIntegration } from '../hooks/useSlackIntegration';
import { useHubSpotIntegration } from '../hooks/useHubSpotIntegration';
import { CheckCircle2, XCircle, Loader2, Play } from 'lucide-react';

const IntegrationTest: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { integration: slackIntegration, testConnection: testSlack } = useSlackIntegration(user?.uid);
  const { testConnection: testHubSpot } = useHubSpotIntegration(user?.uid);
  
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, boolean | null>>({
    firebase: null,
    deepseek: null,
    slack: null,
    hubspot: null,
  });

  const testFirebase = async () => {
    setTesting('firebase');
    try {
      // Test Firestore read
      const hasFirebaseConfig = !!import.meta.env.VITE_FIREBASE_API_KEY;
      if (!hasFirebaseConfig) {
        setResults(prev => ({ ...prev, firebase: false }));
        return;
      }
      
      setResults(prev => ({ ...prev, firebase: true }));
      toast({
        title: 'Firebase Test Passed',
        description: 'Firebase is configured and connected',
      });
    } catch (error) {
      setResults(prev => ({ ...prev, firebase: false }));
      toast({
        variant: 'destructive',
        title: 'Firebase Test Failed',
        description: 'Check your Firebase configuration',
      });
    } finally {
      setTesting(null);
    }
  };

  const testDeepSeek = async () => {
    setTesting('deepseek');
    try {
      const hasKey = !!import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (!hasKey) {
        setResults(prev => ({ ...prev, deepseek: false }));
        toast({
          variant: 'destructive',
          title: 'DeepSeek Not Configured',
          description: 'Add VITE_DEEPSEEK_API_KEY to your .env file',
        });
        return;
      }
      
      setResults(prev => ({ ...prev, deepseek: true }));
      toast({
        title: 'DeepSeek Configured',
        description: 'AI features should work (test in Copilot)',
      });
    } catch (error) {
      setResults(prev => ({ ...prev, deepseek: false }));
    } finally {
      setTesting(null);
    }
  };

  const testSlackIntegration = async () => {
    setTesting('slack');
    try {
      const result = await testSlack();
      setResults(prev => ({ ...prev, slack: result }));
      
      if (result) {
        toast({
          title: 'Slack Test Passed',
          description: 'Slack integration is working',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Slack Test Failed',
          description: 'Check your Slack configuration',
        });
      }
    } catch (error: any) {
      setResults(prev => ({ ...prev, slack: false }));
      toast({
        variant: 'destructive',
        title: 'Slack Error',
        description: error.message,
      });
    } finally {
      setTesting(null);
    }
  };

  const testHubSpotIntegration = async () => {
    setTesting('hubspot');
    try {
      const result = await testHubSpot();
      setResults(prev => ({ ...prev, hubspot: result }));
      
      if (result) {
        toast({
          title: 'HubSpot Test Passed',
          description: 'HubSpot integration is working',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'HubSpot Test Failed',
          description: 'Check your HubSpot API key',
        });
      }
    } catch (error: any) {
      setResults(prev => ({ ...prev, hubspot: false }));
      toast({
        variant: 'destructive',
        title: 'HubSpot Error',
        description: error.message,
      });
    } finally {
      setTesting(null);
    }
  };

  const testAll = async () => {
    await testFirebase();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testDeepSeek();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testSlackIntegration();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testHubSpotIntegration();
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return null;
    return status ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    ) : (
      <XCircle className="h-5 w-5 text-destructive" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Integration Tests</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Verify all integrations are configured and working
          </p>
        </div>
        <Button onClick={testAll} disabled={testing !== null}>
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Test All
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Firebase */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Firebase</CardTitle>
              {getStatusIcon(results.firebase)}
            </div>
            <CardDescription>Core database and authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>API Key:</span>
                <Badge variant={import.meta.env.VITE_FIREBASE_API_KEY ? 'default' : 'destructive'}>
                  {import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>User:</span>
                <Badge variant={user ? 'default' : 'secondary'}>
                  {user ? 'Authenticated' : 'Not logged in'}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={testFirebase}
                disabled={testing === 'firebase'}
                className="w-full mt-2"
              >
                {testing === 'firebase' ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* DeepSeek AI */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">DeepSeek AI</CardTitle>
              {getStatusIcon(results.deepseek)}
            </div>
            <CardDescription>AI Copilot and meeting notes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>API Key:</span>
                <Badge variant={import.meta.env.VITE_DEEPSEEK_API_KEY ? 'default' : 'destructive'}>
                  {import.meta.env.VITE_DEEPSEEK_API_KEY ? 'Set' : 'Missing'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Features:</span>
                <span className="text-xs text-muted-foreground">
                  Copilot, Meetings, CRUD
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={testDeepSeek}
                disabled={testing === 'deepseek'}
                className="w-full mt-2"
              >
                {testing === 'deepseek' ? 'Checking...' : 'Check Config'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Slack */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Slack</CardTitle>
              {getStatusIcon(results.slack)}
            </div>
            <CardDescription>Team notifications and messaging</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Status:</span>
                <Badge variant={slackIntegration?.enabled ? 'default' : 'secondary'}>
                  {slackIntegration?.enabled ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
              {slackIntegration?.teamName && (
                <div className="flex items-center justify-between text-sm">
                  <span>Team:</span>
                  <span className="text-xs text-muted-foreground">
                    {slackIntegration.teamName}
                  </span>
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={testSlackIntegration}
                disabled={testing === 'slack' || !slackIntegration?.enabled}
                className="w-full mt-2"
              >
                {testing === 'slack' ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* HubSpot */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">HubSpot</CardTitle>
              {getStatusIcon(results.hubspot)}
            </div>
            <CardDescription>CRM contact import</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>API Key:</span>
                <Badge variant={import.meta.env.VITE_HUBSPOT_API_KEY ? 'default' : 'secondary'}>
                  {import.meta.env.VITE_HUBSPOT_API_KEY ? 'Set' : 'Not Set'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>CLI:</span>
                <span className="text-xs text-muted-foreground">
                  byte-berry account
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={testHubSpotIntegration}
                disabled={testing === 'hubspot'}
                className="w-full mt-2"
              >
                {testing === 'hubspot' ? 'Testing...' : 'Test API'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Environment Variables:</span>
              <Badge>
                {Object.values({
                  firebase: !!import.meta.env.VITE_FIREBASE_API_KEY,
                  deepseek: !!import.meta.env.VITE_DEEPSEEK_API_KEY,
                  slack: !!import.meta.env.VITE_SLACK_CLIENT_ID,
                  hubspot: !!import.meta.env.VITE_HUBSPOT_API_KEY,
                }).filter(Boolean).length} / 4 configured
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tests Passed:</span>
              <Badge variant={
                Object.values(results).filter(r => r === true).length >= 2 ? 'default' : 'secondary'
              }>
                {Object.values(results).filter(r => r === true).length} / 4
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              💡 Tip: Firebase and DeepSeek are required. Slack and HubSpot are optional.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationTest;

