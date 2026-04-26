import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { checkBridgeHealth, createBridgeMission, DEFAULT_BRIDGE_URL, getBridgeMission } from './src/lib/founderBridge';
import type { BridgeMission, PathMode } from './src/types';
type TabKey = 'path' | 'briefing' | 'missions' | 'board';

type Scenario = {
  title: string;
  subtitle: string;
  thesis: string;
  leverage: number;
  speed: number;
  complexity: number;
  cash: string;
  nextMoves: string[];
};

type Mission = {
  title: string;
  owner: string;
  runtime: string;
  status: 'ready' | 'approval' | 'blocked';
  objective: string;
};

const scenarios: Record<PathMode, Scenario> = {
  launch: {
    title: 'Launch New Venture',
    subtitle: 'Maximum control, slower trust accumulation',
    thesis:
      'Start with a clean operating system, sharper category language, and a narrower wedge. You trade time for design freedom.',
    leverage: 72,
    speed: 59,
    complexity: 64,
    cash: '$14k to first proof cycle',
    nextMoves: [
      'Lock one category sentence and one buyer',
      'Turn Codex-backed workflows into visible proof',
      'Ship a founder-grade operator loop before expanding scope',
    ],
  },
  acquire: {
    title: 'Acquire Existing Company',
    subtitle: 'Faster revenue surface, heavier cleanup burden',
    thesis:
      'Take over something with customers, systems, and drift. The upside is instant surface area; the downside is inherited entropy.',
    leverage: 85,
    speed: 78,
    complexity: 88,
    cash: '$45k plus transition runway',
    nextMoves: [
      'Audit process debt before touching branding',
      'Replace fragile operators with governed Codex missions',
      'Create a buyer-safe transition narrative in 30 days',
    ],
  },
};

const missions: Record<PathMode, Mission[]> = {
  launch: [
    {
      title: 'Design launch wedge',
      owner: 'Founder',
      runtime: 'Codex CLI',
      status: 'ready',
      objective: 'Produce category sentence, landing draft, and buyer objections map.',
    },
    {
      title: 'Generate first workflow proof',
      owner: 'AgentOps runtime',
      runtime: 'Codex CLI + OpenRouter',
      status: 'approval',
      objective: 'Run PR review simulation pack and extract measurable ROI claims.',
    },
    {
      title: 'Prepare founder narrative',
      owner: 'Board mode',
      runtime: 'Gemini CLI',
      status: 'blocked',
      objective: 'Needs final ICP lock before investor-grade story can be generated.',
    },
  ],
  acquire: [
    {
      title: 'Map inherited company systems',
      owner: 'Operator',
      runtime: 'Codex CLI',
      status: 'ready',
      objective: 'Inventory repos, agents, approvals, vendors, and financial choke points.',
    },
    {
      title: 'Rewrite trust loop',
      owner: 'AgentOps runtime',
      runtime: 'Codex CLI + Claude Code',
      status: 'approval',
      objective: 'Replace ad hoc execution with governed workflows and escalation rules.',
    },
    {
      title: 'Post-acquisition retention plan',
      owner: 'Commercial mode',
      runtime: 'OpenRouter',
      status: 'blocked',
      objective: 'Blocked until customer migration risks are scored.',
    },
  ],
};

const tabs: { key: TabKey; label: string }[] = [
  { key: 'path', label: 'Path' },
  { key: 'briefing', label: 'Briefing' },
  { key: 'missions', label: 'Missions' },
  { key: 'board', label: 'Board' },
];

function StatBar({ label, value, tint }: { label: string; value: number; tint: string }) {
  return (
    <View style={styles.statBlock}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value}%`, backgroundColor: tint }]} />
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: Mission['status'] }) {
  const tone =
    status === 'ready'
      ? styles.statusReady
      : status === 'approval'
        ? styles.statusApproval
        : styles.statusBlocked;

  return (
    <View style={[styles.statusPill, tone]}>
      <Text style={styles.statusText}>{status.toUpperCase()}</Text>
    </View>
  );
}

export default function App() {
  const [mode, setMode] = useState<PathMode>('launch');
  const [tab, setTab] = useState<TabKey>('path');
  const [bridgeUrl, setBridgeUrl] = useState(DEFAULT_BRIDGE_URL);
  const [bridgeToken, setBridgeToken] = useState('replace-me');
  const [bridgeState, setBridgeState] = useState('Bridge not checked yet');
  const [activeMission, setActiveMission] = useState<BridgeMission | null>(null);
  const [missionLoading, setMissionLoading] = useState(false);

  const activeScenario = scenarios[mode];
  const activeMissions = missions[mode];
  const readinessScore = useMemo(() => {
    return Math.round((activeScenario.leverage + activeScenario.speed + (100 - activeScenario.complexity)) / 3);
  }, [activeScenario]);

  useEffect(() => {
    if (!activeMission || !['queued', 'running'].includes(activeMission.status)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const mission = await getBridgeMission(bridgeUrl, bridgeToken, activeMission.id);
        setActiveMission(mission);
      } catch (error) {
        setBridgeState(error instanceof Error ? error.message : 'Bridge polling failed');
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeMission, bridgeToken, bridgeUrl]);

  async function handleHealthCheck() {
    try {
      setBridgeState('Checking bridge...');
      const response = await checkBridgeHealth(bridgeUrl);
      setBridgeState(response.mockCodex ? 'Bridge reachable in mock mode' : 'Bridge reachable with live Codex mode');
    } catch (error) {
      setBridgeState(error instanceof Error ? error.message : 'Bridge check failed');
    }
  }

  async function handleRunMission() {
    try {
      setMissionLoading(true);
      const created = await createBridgeMission(bridgeUrl, bridgeToken, mode);
      setBridgeState('Mission accepted by bridge');
      const mission = await getBridgeMission(bridgeUrl, bridgeToken, created.missionId);
      setActiveMission(mission);
      setTab('missions');
    } catch (error) {
      setBridgeState(error instanceof Error ? error.message : 'Mission creation failed');
    } finally {
      setMissionLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.backgroundOrbA} />
      <View style={styles.backgroundOrbB} />

      <View style={styles.shell}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>CORPAI FOUNDER MODE</Text>
          <Text style={styles.heroTitle}>Choose whether to build from zero or take over something real.</Text>
          <Text style={styles.heroBody}>
            This internal app is meant to feel like the operator cockpit: strategy, missions, risk, and Codex-backed execution sitting in one mobile surface.
          </Text>
          <View style={styles.heroMetrics}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Mode readiness</Text>
              <Text style={styles.metricValue}>{readinessScore}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Primary runtime</Text>
              <Text style={styles.metricValueSmall}>Codex CLI brokered by a local bridge</Text>
            </View>
          </View>
        </View>

        <View style={styles.segmented}>
          {tabs.map((item) => (
            <Pressable key={item.key} onPress={() => setTab(item.key)} style={[styles.segment, tab === item.key && styles.segmentActive]}>
              <Text style={[styles.segmentText, tab === item.key && styles.segmentTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {tab === 'path' ? (
            <View style={styles.stack}>
              <Text style={styles.sectionTitle}>Pick the founder path</Text>
              <View style={styles.switchRow}>
                <Pressable onPress={() => setMode('launch')} style={[styles.modeCard, mode === 'launch' && styles.modeCardActive]}>
                  <Text style={styles.modeLabel}>Launch New</Text>
                  <Text style={styles.modeCopy}>Design the company, story, and product loop from scratch.</Text>
                </Pressable>
                <Pressable onPress={() => setMode('acquire')} style={[styles.modeCard, mode === 'acquire' && styles.modeCardActive]}>
                  <Text style={styles.modeLabel}>Acquire Existing</Text>
                  <Text style={styles.modeCopy}>Take over operations and rebuild the system without losing momentum.</Text>
                </Pressable>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{activeScenario.title}</Text>
                <Text style={styles.panelSubtitle}>{activeScenario.subtitle}</Text>
                <Text style={styles.panelBody}>{activeScenario.thesis}</Text>
                <View style={styles.cashBanner}>
                  <Text style={styles.cashLabel}>Cash posture</Text>
                  <Text style={styles.cashValue}>{activeScenario.cash}</Text>
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Bridge setup</Text>
                <Text style={styles.panelBody}>
                  Point this app at the PC running the local founder bridge. That bridge owns Codex CLI execution on the machine and sends back mission status.
                </Text>
                <TextInput
                  value={bridgeUrl}
                  onChangeText={setBridgeUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="http://YOUR-PC-IP:8788"
                  placeholderTextColor="#7b718b"
                  style={styles.input}
                />
                <TextInput
                  value={bridgeToken}
                  onChangeText={setBridgeToken}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Bridge token"
                  placeholderTextColor="#7b718b"
                  style={styles.input}
                />
                <View style={styles.buttonRow}>
                  <Pressable onPress={handleHealthCheck} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Check Bridge</Text>
                  </Pressable>
                  <Pressable onPress={handleRunMission} style={[styles.actionButton, styles.actionButtonPrimary]}>
                    <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                      Run {mode === 'launch' ? 'Launch' : 'Acquire'} Mission
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.bridgeState}>{bridgeState}</Text>
              </View>
            </View>
          ) : null}

          {tab === 'briefing' ? (
            <View style={styles.stack}>
              <Text style={styles.sectionTitle}>Founder briefing</Text>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>What this path optimizes for</Text>
                <StatBar label="Leverage" value={activeScenario.leverage} tint="#f4a640" />
                <StatBar label="Speed to proof" value={activeScenario.speed} tint="#df6d57" />
                <StatBar label="Complexity burden" value={activeScenario.complexity} tint="#7e7ff2" />
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Immediate next moves</Text>
                {activeScenario.nextMoves.map((move) => (
                  <View key={move} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{move}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {tab === 'missions' ? (
            <View style={styles.stack}>
              <Text style={styles.sectionTitle}>Codex-backed missions</Text>
              {missionLoading ? (
                <View style={styles.panel}>
                  <ActivityIndicator color="#f1b25f" />
                  <Text style={styles.bridgeState}>Submitting mission to local bridge...</Text>
                </View>
              ) : null}
              {activeMission ? (
                <View style={styles.panel}>
                  <View style={styles.rowBetween}>
                    <View style={styles.missionHeader}>
                      <Text style={styles.panelTitle}>Live bridge mission</Text>
                      <Text style={styles.missionMeta}>
                        {activeMission.mode === 'launch' ? 'Launch New' : 'Acquire Existing'} · {activeMission.id.slice(0, 8)}
                      </Text>
                    </View>
                    <StatusPill status={activeMission.status === 'failed' ? 'blocked' : activeMission.status === 'completed' ? 'ready' : 'approval'} />
                  </View>
                  <Text style={styles.panelBody}>{activeMission.summary || 'Waiting for mission summary...'}</Text>
                  {activeMission.finalMessage ? <Text style={styles.finalMessage}>{activeMission.finalMessage}</Text> : null}
                  {(activeMission.logs || []).slice(-5).map((line, index) => (
                    <Text key={`${activeMission.id}-${index}`} style={styles.logLine}>
                      {line}
                    </Text>
                  ))}
                </View>
              ) : null}
              {activeMissions.map((mission) => (
                <View key={mission.title} style={styles.panel}>
                  <View style={styles.rowBetween}>
                    <View style={styles.missionHeader}>
                      <Text style={styles.panelTitle}>{mission.title}</Text>
                      <Text style={styles.missionMeta}>
                        {mission.owner} · {mission.runtime}
                      </Text>
                    </View>
                    <StatusPill status={mission.status} />
                  </View>
                  <Text style={styles.panelBody}>{mission.objective}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {tab === 'board' ? (
            <View style={styles.stack}>
              <Text style={styles.sectionTitle}>Board guidance</Text>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>What the board would say now</Text>
                <Text style={styles.panelBody}>
                  {mode === 'launch'
                    ? 'Stay narrow. Prove one workflow hard. Use the mobile app as a founder cockpit, not as a distraction from the AgentOps wedge.'
                    : 'Do not rebrand before you de-risk the operations. Use Codex-backed missions to map and replace fragile processes before you promise change.'}
                </Text>
              </View>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Why Codex belongs here</Text>
                <Text style={styles.panelBody}>
                  The phone should not run Codex directly. CorpAI should broker Codex CLI server-side, handle approvals, preserve artifacts, and stream the outcome back into this mobile surface.
                </Text>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#09050f',
  },
  shell: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  backgroundOrbA: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: '#5034b7',
    opacity: 0.24,
  },
  backgroundOrbB: {
    position: 'absolute',
    bottom: 40,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: '#d96f44',
    opacity: 0.16,
  },
  heroCard: {
    backgroundColor: 'rgba(18, 12, 29, 0.92)',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  eyebrow: {
    color: '#f1b25f',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 10,
  },
  heroTitle: {
    color: '#fbf8ff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  heroBody: {
    color: '#c3bad3',
    fontSize: 15,
    lineHeight: 22,
  },
  heroMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 14,
  },
  metricLabel: {
    color: '#9589a9',
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    color: '#fff7eb',
    fontSize: 26,
    fontWeight: '800',
  },
  metricValueSmall: {
    color: '#fff7eb',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 6,
    gap: 6,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 14,
  },
  segmentActive: {
    backgroundColor: '#f1b25f',
  },
  segmentText: {
    color: '#b5abca',
    fontWeight: '700',
    fontSize: 12,
  },
  segmentTextActive: {
    color: '#1f1427',
  },
  content: {
    paddingTop: 18,
    paddingBottom: 40,
  },
  stack: {
    gap: 14,
  },
  sectionTitle: {
    color: '#fffaf0',
    fontSize: 22,
    fontWeight: '800',
  },
  switchRow: {
    gap: 12,
  },
  input: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: '#fffaf0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#f1b25f',
  },
  actionButtonText: {
    color: '#fdf5e7',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  actionButtonTextPrimary: {
    color: '#201526',
  },
  bridgeState: {
    color: '#b5abca',
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
  },
  modeCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modeCardActive: {
    borderColor: '#f1b25f',
    backgroundColor: 'rgba(241,178,95,0.12)',
  },
  modeLabel: {
    color: '#fffaf0',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  modeCopy: {
    color: '#c5bbd6',
    fontSize: 14,
    lineHeight: 20,
  },
  panel: {
    backgroundColor: 'rgba(18, 12, 29, 0.9)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  panelTitle: {
    color: '#fffaf0',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  panelSubtitle: {
    color: '#f1b25f',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  panelBody: {
    color: '#c6bdd6',
    fontSize: 14,
    lineHeight: 21,
  },
  cashBanner: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 14,
  },
  cashLabel: {
    color: '#978cab',
    fontSize: 12,
    marginBottom: 4,
  },
  cashValue: {
    color: '#fff6e8',
    fontSize: 18,
    fontWeight: '800',
  },
  statBlock: {
    marginTop: 10,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    color: '#c8bfd8',
    fontSize: 13,
  },
  statValue: {
    color: '#fffaf0',
    fontWeight: '800',
  },
  track: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#f1b25f',
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    color: '#c6bdd6',
    fontSize: 14,
    lineHeight: 21,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  missionHeader: {
    flex: 1,
  },
  missionMeta: {
    color: '#9d92af',
    fontSize: 12,
    fontWeight: '600',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusReady: {
    backgroundColor: 'rgba(79, 184, 111, 0.18)',
  },
  statusApproval: {
    backgroundColor: 'rgba(241, 178, 95, 0.18)',
  },
  statusBlocked: {
    backgroundColor: 'rgba(223, 109, 87, 0.18)',
  },
  statusText: {
    color: '#fffaf0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  finalMessage: {
    color: '#fff6e8',
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  logLine: {
    color: '#9f95b0',
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
  },
});
