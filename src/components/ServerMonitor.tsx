// @ts-nocheck - styled-components v5 React 18 TypeScript compatibility issues
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

interface FishMetadata {
  tokenId: string;
  metadataUrl: string;
  imageUrl: string;
  videoUrl: string;
  assetsAvailable?: {
    image: boolean;
    video: boolean;
  };
}

interface FishList {
  total: number;
  fish: FishMetadata[];
  note: string;
}

// Use production server URL, fallback to localhost for development
// In production, always use the production server
const getServerUrl = () => {
  // Check environment variables first
  if (process.env.REACT_APP_SERVER_URL) {
    return process.env.REACT_APP_SERVER_URL;
  }
  if (process.env.REACT_APP_METADATA_SERVER_URL) {
    return process.env.REACT_APP_METADATA_SERVER_URL;
  }
  // In production build, use production server
  if (process.env.NODE_ENV === 'production') {
    return 'https://fishfight-server-production.up.railway.app';
  }
  // Development fallback
  return 'http://localhost:3001';
};

const SERVER_URL = getServerUrl();

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
      case 'ok': return '#4caf50';
      case 'degraded': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#757575';
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return '#f44336';
      case 'warn': return '#ff9800';
      case 'success': return '#4caf50';
      default: return '#2196f3';
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
    <Container>
      <Header>
        <Title>🐟 FishFight Server Monitor</Title>
        <RefreshButton onClick={refreshAll} disabled={loading}>
          {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
        </RefreshButton>
      </Header>

      {error && (
        <Alert error>
          {error}
        </Alert>
      )}

      <Tabs>
        <TabButton active={activeTab === 0} onClick={() => setActiveTab(0)}>
          Health & Status
        </TabButton>
        <TabButton active={activeTab === 1} onClick={() => setActiveTab(1)}>
          Server Logs
        </TabButton>
        <TabButton active={activeTab === 2} onClick={() => setActiveTab(2)}>
          Fish Metadata
        </TabButton>
      </Tabs>

      {/* Health & Status Tab */}
      {activeTab === 0 && (
        <Content>
          {health && (
            <Card>
              <CardHeader>
                <CardTitle>Server Status</CardTitle>
                <StatusBadge color={getStatusColor(health.status)}>
                  {health.status.toUpperCase()}
                </StatusBadge>
              </CardHeader>

              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Service</InfoLabel>
                  <InfoValue>{health.service} v{health.version}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Network</InfoLabel>
                  <InfoValue>{health.network}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Uptime</InfoLabel>
                  <InfoValue>{formatUptime(health.uptime)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Memory Usage</InfoLabel>
                  <InfoValue>{formatMemory(health.memory.heapUsed)}</InfoValue>
                </InfoItem>
              </InfoGrid>

              <SectionTitle>Configuration</SectionTitle>
              <ChipContainer>
                <Chip success={health.config.hasPrivateKey}>
                  Private Key {health.config.hasPrivateKey ? '✅' : '❌'}
                </Chip>
                <Chip success={health.config.hasPinataKeys}>
                  Pinata Keys {health.config.hasPinataKeys ? '✅' : '❌'}
                </Chip>
                <Chip success={health.config.hasContractAddress}>
                  Contract Address {health.config.hasContractAddress ? '✅' : '❌'}
                </Chip>
                <Chip success={health.config.rpcConfigured}>
                  RPC Config {health.config.rpcConfigured ? '✅' : '❌'}
                </Chip>
              </ChipContainer>

              {health.warnings && health.warnings.length > 0 && (
                <WarningBox>
                  <WarningTitle>⚠️ Warnings:</WarningTitle>
                  <WarningList>
                    {health.warnings.map((warning, index) => (
                      <WarningItem key={index}>{warning}</WarningItem>
                    ))}
                  </WarningList>
                </WarningBox>
              )}
            </Card>
          )}
        </Content>
      )}

      {/* Server Logs Tab */}
      {activeTab === 1 && (
        <Content>
          <Card>
            <CardHeader>
              <CardTitle>Server Logs</CardTitle>
              <ClearButton onClick={clearLogs}>🗑️ Clear Logs</ClearButton>
            </CardHeader>

            <LogsContainer>
              {logs.map((log, index) => (
                <LogItem key={index}>
                  <LogLevel color={getLogColor(log.level)}>
                    {log.level.toUpperCase()}
                  </LogLevel>
                  <LogTime>{new Date(log.timestamp).toLocaleTimeString()}</LogTime>
                  <LogMessage>{log.message}</LogMessage>
                </LogItem>
              ))}
            </LogsContainer>

            {logs.length === 0 && (
              <EmptyState>No logs available</EmptyState>
            )}
          </Card>
        </Content>
      )}

      {/* Fish Metadata Tab */}
      {activeTab === 2 && (
        <Content>
          <Card>
            {fish && (
              <>
                <CardHeader>
                  <CardTitle>Fish Metadata ({fish.total} fish)</CardTitle>
                </CardHeader>
                {fish.note && (
                  <InfoBox>
                    {fish.note}
                  </InfoBox>
                )}

                <FishListContainer>
                  {fish.fish.map((fishItem) => (
                    <FishItem key={fishItem.tokenId}>
                      <FishHeader>
                        <FishTitle>Fish #{fishItem.tokenId}</FishTitle>
                        {fishItem.assetsAvailable && (
                          <AssetStatus>
                            {fishItem.assetsAvailable.image ? '📸' : '❌'} 
                            {fishItem.assetsAvailable.video ? '🎥' : '❌'}
                          </AssetStatus>
                        )}
                      </FishHeader>
                      <FishDetails>
                        <DetailRow>
                          <strong>Metadata URL:</strong> {fishItem.metadataUrl}
                        </DetailRow>
                        <DetailRow>
                          <strong>Image URL:</strong> {fishItem.imageUrl}
                        </DetailRow>
                        <DetailRow>
                          <strong>Video URL:</strong> {fishItem.videoUrl}
                        </DetailRow>
                        <ButtonRow>
                          <ActionButton onClick={() => window.open(fishItem.metadataUrl, '_blank')}>
                            View Metadata
                          </ActionButton>
                          <ActionButton onClick={() => window.open(fishItem.imageUrl, '_blank')}>
                            View Image
                          </ActionButton>
                          <ActionButton onClick={() => window.open(fishItem.videoUrl, '_blank')}>
                            View Video
                          </ActionButton>
                        </ButtonRow>
                      </FishDetails>
                    </FishItem>
                  ))}
                </FishListContainer>
              </>
            )}
          </Card>
        </Content>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  color: white;
`;

const RefreshButton = styled.button`
  padding: 10px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #1976d2;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Alert = styled.div<{ error?: boolean }>`
  padding: 15px;
  margin-bottom: 20px;
  background: ${props => props.error ? '#f44336' : '#2196f3'};
  color: white;
  border-radius: 4px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  background: ${props => props.active ? '#2196f3' : 'transparent'};
  color: white;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#2196f3' : 'transparent'};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#2196f3' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const Content = styled.div`
  margin-top: 20px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: white;
`;

const StatusBadge = styled.span<{ color: string }>`
  padding: 5px 15px;
  background: ${props => props.color};
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  color: white;
  font-weight: 500;
`;

const SectionTitle = styled.h3`
  margin: 20px 0 10px 0;
  font-size: 1.2rem;
  color: white;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const Chip = styled.span<{ success?: boolean }>`
  padding: 5px 12px;
  background: ${props => props.success ? '#4caf50' : '#f44336'};
  color: white;
  border-radius: 20px;
  font-size: 12px;
`;

const WarningBox = styled.div`
  padding: 15px;
  background: rgba(255, 152, 0, 0.2);
  border-left: 4px solid #ff9800;
  border-radius: 4px;
  margin-top: 20px;
`;

const WarningTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
  color: #ff9800;
`;

const WarningList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: white;
`;

const WarningItem = styled.li`
  margin: 5px 0;
`;

const ClearButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const LogsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 10px;
`;

const LogItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const LogLevel = styled.span<{ color: string }>`
  padding: 4px 8px;
  background: ${props => props.color};
  color: white;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
`;

const LogTime = styled.span`
  font-family: monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 100px;
`;

const LogMessage = styled.span`
  font-size: 14px;
  color: white;
  flex: 1;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
`;

const InfoBox = styled.div`
  padding: 15px;
  background: rgba(33, 150, 243, 0.2);
  border-left: 4px solid #2196f3;
  border-radius: 4px;
  margin-bottom: 20px;
  color: white;
`;

const FishListContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const FishItem = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
`;

const FishHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const FishTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: white;
`;

const AssetStatus = styled.span`
  font-size: 18px;
`;

const FishDetails = styled.div`
  margin-top: 10px;
`;

const DetailRow = styled.div`
  margin: 8px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);

  strong {
    color: white;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;

  &:hover {
    background: #1976d2;
  }
`;
