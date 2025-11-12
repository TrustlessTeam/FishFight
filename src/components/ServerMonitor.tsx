import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

interface ServerHealth {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  network: string;
  timestamp: string;
  uptime: number;
  memory: any;
  config: {
    hasPrivateKey: boolean;
    hasPinataKeys: boolean;
    hasContractAddress: boolean;
    rpcConfigured: boolean;
  };
  warnings?: string[];
}

interface ServerLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

interface FishMetadata {
  tokenId: string;
  metadataUrl: string;
  imageUrl: string;
  videoUrl: string;
}

interface FishList {
  total: number;
  fish: FishMetadata[];
  note: string;
}

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

export const ServerMonitor: React.FC = () => {
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [fish, setFish] = useState<FishList | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/health`);
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError('Failed to connect to server');
      setHealth(null);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/logs`);
      const data = await response.json();
      setLogs(data.logs);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  const fetchFish = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/fish`);
      const data = await response.json();
      setFish(data);
    } catch (err) {
      console.error('Failed to fetch fish:', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchHealth(), fetchLogs(), fetchFish()]);
    setLoading(false);
  };

  const clearLogs = async () => {
    try {
      await fetch(`${SERVER_URL}/logs/clear`, { method: 'POST' });
      await fetchLogs();
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  useEffect(() => {
    refreshAll();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'success';
      case 'degraded': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        🐟 FishFight Server Monitor
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={refreshAll}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Health & Status" />
        <Tab label="Server Logs" />
        <Tab label="Fish Metadata" />
      </Tabs>

      {/* Health & Status Tab */}
      {activeTab === 0 && (
        <Box>
          {health && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ mr: 2 }}>
                    Server Status
                  </Typography>
                  <Chip
                    label={health.status.toUpperCase()}
                    color={getStatusColor(health.status)}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Service</Typography>
                    <Typography>{health.service} v{health.version}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Network</Typography>
                    <Typography>{health.network}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Uptime</Typography>
                    <Typography>{formatUptime(health.uptime)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Memory Usage</Typography>
                    <Typography>{formatMemory(health.memory.heapUsed)}</Typography>
                  </Box>
                </Box>

                <Typography variant="h6" sx={{ mb: 1 }}>Configuration</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    label="Private Key"
                    color={health.config.hasPrivateKey ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip
                    label="Pinata Keys"
                    color={health.config.hasPinataKeys ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip
                    label="Contract Address"
                    color={health.config.hasContractAddress ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip
                    label="RPC Config"
                    color={health.config.rpcConfigured ? 'success' : 'error'}
                    size="small"
                  />
                </Box>

                {health.warnings && health.warnings.length > 0 && (
                  <Alert severity="warning">
                    <Typography variant="body2" sx={{ mb: 1 }}>Warnings:</Typography>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {health.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Server Logs Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Server Logs</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={clearLogs}
                startIcon={<StopIcon />}
              >
                Clear Logs
              </Button>
            </Box>

            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {logs.map((log, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={log.level.toUpperCase()}
                          color={log.level === 'error' ? 'error' : log.level === 'warn' ? 'warning' : 'default'}
                          size="small"
                          sx={{ minWidth: 60 }}
                        />
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </Typography>
                        <Typography variant="body2">{log.message}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {logs.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No logs available
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fish Metadata Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            {fish && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Fish Metadata ({fish.total} fish)
                  </Typography>
                  {fish.note && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      {fish.note}
                    </Alert>
                  )}
                </Box>

                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {fish.fish.map((fishItem) => (
                    <Accordion key={fishItem.tokenId}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Fish #{fishItem.tokenId}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Metadata URL:</strong> {fishItem.metadataUrl}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Image URL:</strong> {fishItem.imageUrl}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Video URL:</strong> {fishItem.videoUrl}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(fishItem.metadataUrl, '_blank')}
                          >
                            View Metadata
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(fishItem.imageUrl, '_blank')}
                          >
                            View Image
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => window.open(fishItem.videoUrl, '_blank')}
                          >
                            View Video
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
